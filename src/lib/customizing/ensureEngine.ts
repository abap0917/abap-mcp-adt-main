/**
 * ensureEngine — autoDeploy gate for the customizing write tools (aligned with
 * upstream abap-config-mcp's `autoDeploy` semantics).
 *
 * Behaviour (skipped entirely when autoDeploy === false):
 *   1. Fast path: ping the engine. If reachable AND the deployed version
 *      matches ENGINE_VERSION, nothing to do.
 *   2. Otherwise read the deployed class source from SAP and compare its
 *      `c_version` constant (covers hand-deployed classes that kept the
 *      {{ENGINE_VERSION}} placeholder), plus check the writer report exists.
 *   3. Missing or stale → deploy class + writer report (create / update-in-
 *      place + activate) via deployEngine.
 *   4. Ping again; if the engine is still unreachable, the ABAP side is fine
 *      but the SICF node is not — throw a targeted error with registration
 *      instructions (SICF can never be auto-registered headlessly).
 */

import {
  ENGINE_CLASS_NAME,
  ENGINE_CLASS_URL,
  ENGINE_ICF_PATH,
  ENGINE_VERSION,
  getEngineSource,
  getWriterSource,
  WRITER_REPORT_NAME,
  WRITER_REPORT_URL,
} from '../../abap/engineMeta.js';
import type { HandlerContext } from '../../handlers/interfaces.js';
import {
  type DeployOptions,
  deployClass,
  deployReport,
} from './deployEngine.js';
import { callEngine, type EngineResponse } from './engineClient.js';

const SOURCE_ACCEPT = 'application/vnd.sap.adt.abapsource.v1+xml';

async function readClassVersion(
  context: HandlerContext,
): Promise<string | null> {
  const { connection, logger } = context;
  try {
    const resp = await connection.makeAdtRequest({
      url: `${ENGINE_CLASS_URL}/source/main`,
      method: 'GET',
      timeout: 30_000,
      headers: { Accept: SOURCE_ACCEPT },
    });
    const xml =
      typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    // c_version is a CONSTANTS string literal; tolerate pretty-printer reflow.
    const m = xml.match(/c_version\b[\s\S]*?VALUE\s+'([^']+)'/i);
    return m ? m[1] : null;
  } catch {
    return null; // class missing / not readable
  }
}

async function reportExists(context: HandlerContext): Promise<boolean> {
  const { connection } = context;
  try {
    const resp = await connection.makeAdtRequest({
      url: `${WRITER_REPORT_URL}/source/main`,
      method: 'GET',
      timeout: 30_000,
      headers: { Accept: SOURCE_ACCEPT },
    });
    return resp.status === 200;
  } catch {
    return false;
  }
}

async function pingEngine(
  context: HandlerContext,
): Promise<EngineResponse | null> {
  try {
    return await callEngine(
      context.connection,
      context.logger,
      'ping',
      {},
      15_000,
    );
  } catch {
    return null;
  }
}

function sicfGuidance(): string {
  return (
    `Customizing engine ABAP objects are in place, but the ICF service is not reachable at ${ENGINE_ICF_PATH}. ` +
    `Register + activate the SICF node in transaction SICF (handler class ${ENGINE_CLASS_NAME}), then retry.`
  );
}

/**
 * Ensure the customizing engine is deployed and reachable before a write.
 * @returns a human-readable note of what was done ('' when already fresh).
 */
export async function ensureEngine(
  context: HandlerContext,
  opts: { autoDeploy?: boolean } & DeployOptions = {},
): Promise<string> {
  if (opts.autoDeploy === false) return '';
  const { logger } = context;

  // Fast path: engine reachable and version fresh.
  let ping = await pingEngine(context);
  if (ping?.STATUS === 'ok' && ping.VERSION === ENGINE_VERSION) return '';

  // Determine staleness from the deployed class source.
  const deployedVersion = await readClassVersion(context);
  const writerOk = await reportExists(context);
  const needsDeploy = deployedVersion !== ENGINE_VERSION || !writerOk;

  if (!needsDeploy && ping) {
    // Version fresh, but ping failed → SICF problem.
    throw new Error(sicfGuidance());
  }
  if (!needsDeploy && !ping) {
    // Version fresh but engine unreachable and class readable → SICF problem.
    throw new Error(sicfGuidance());
  }

  // Deploy (or update-in-place) the engine class + writer report.
  logger?.info(
    `ensureEngine: deploying engine (class v=${deployedVersion ?? 'missing'}, writer=${writerOk ? 'ok' : 'missing'})`,
  );
  let engineSource: string;
  let writerSource: string;
  try {
    engineSource = getEngineSource();
    writerSource = getWriterSource();
  } catch (err: any) {
    throw new Error(
      `ABAP sources not found: ${err.message}\nSet ABAP_SRC_DIR to the directory holding the .abap files.`,
    );
  }
  const notes: string[] = [];
  let cls: { created: boolean; activated: boolean } | undefined;
  let rep: { created: boolean; activated: boolean } | undefined;
  try {
    cls = await deployClass(context, ENGINE_CLASS_NAME, engineSource, opts);
    notes.push(
      `${ENGINE_CLASS_NAME} ${cls.created ? 'created' : 'updated in place'} + activated`,
    );
    rep = await deployReport(context, WRITER_REPORT_NAME, writerSource, opts);
    notes.push(
      `${WRITER_REPORT_NAME} ${rep.created ? 'created' : 'updated in place'} + activated`,
    );
  } catch (err: any) {
    // The engine is functional (ping succeeded) but the ABAP objects are
    // locked (open SE24/SE80 editor or a lock entry in a transport request).
    // Don't block the write on a cosmetic redeploy — warn and proceed.
    const detail = String(err?.message ?? err).toLowerCase();
    const locked = detail.includes('lock') || detail.includes('锁定');
    if (ping?.STATUS === 'ok' && locked) {
      logger?.warn(
        `ensureEngine: redeploy skipped (object locked): ${err.message}`,
      );
      return `autoDeploy skipped: engine objects are locked (${err.message}) — release the lock (SE03 → unlock objects, close the SE24/SE80 editor) to let autoDeploy refresh the version. Engine v${ping.VERSION} is functional.`;
    }
    throw err;
  }

  // Re-ping to confirm end-to-end (ABAP objects + SICF).
  ping = await pingEngine(context);
  if (!ping || ping.STATUS !== 'ok') {
    throw new Error(sicfGuidance());
  }
  if (ping.VERSION !== ENGINE_VERSION) {
    logger?.warn(
      `ensureEngine: deployed version ${ping.VERSION} ≠ repo ${ENGINE_VERSION}`,
    );
  }
  return `autoDeploy: ${notes.join('; ')}; engine v${ping.VERSION} reachable.`;
}
