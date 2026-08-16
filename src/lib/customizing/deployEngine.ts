/**
 * Engine object deployment helpers — create / update-in-place / activate the
 * ABAP engine objects (class ZCL_MCP_CUST_ENGINE, report ZMCP_CUST_WRITE,
 * optional ZCL_MCP_DIAG) using the server's own ADT client tooling.
 *
 * Extracted from the CustomizingEngineBootstrap handler so the autoDeploy path
 * (ensureEngine) shares the same code.
 */

import { ENGINE_VERSION } from '../../abap/engineMeta.js';
import type { HandlerContext } from '../../handlers/interfaces.js';
import { createAdtClient } from '../clients.js';

export interface DeployOptions {
  package_name?: string;
  transport_request?: string;
}

export interface DeployResult {
  created: boolean;
  activated: boolean;
}

/** Extract the meaningful message from an ADT/Axios error (XML exception text). */
export function describeAdtError(err: any): string {
  const base = err?.message ?? String(err);
  const data = err?.response?.data;
  if (!data) return base;
  const s = typeof data === 'string' ? data : JSON.stringify(data);
  const msg =
    s.match(/<(?:[a-zA-Z0-9_]+:)?message[^>]*>([^<]+)</) ||
    s.match(/<(?:[a-zA-Z0-9_]+:)?localizedMessage[^>]*>([^<]+)</);
  if (msg) return `${base} — ${msg[1]}`;
  return `${base} — ${s.slice(0, 300)}`;
}

function rethrowDetailed(err: any): never {
  throw new Error(describeAdtError(err));
}

const LOCK_ACCEPT =
  'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result;q=0.8, ' +
  'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result2;q=0.9';

/**
 * Update-in-place for an existing ABAP object: explicit lock → PUT source with
 * corrNr → unlock, with the stateful/stateless session dance the ADT lock
 * requires. The corrNr comes from the lock response (this SAP auto-creates a
 * request per lock) or the caller-supplied transport — some releases reject a
 * source PUT without a corrNr parameter ("Parameter corrNr could not be found").
 */
async function updateInPlace(
  context: HandlerContext,
  kind: 'class' | 'report',
  name: string,
  source: string,
  transport: string | undefined,
): Promise<void> {
  const { connection, logger } = context;
  const lower = name.toLowerCase();
  const base =
    kind === 'class'
      ? `/sap/bc/adt/oo/classes/${lower}`
      : `/sap/bc/adt/programs/programs/${lower}`;
  const timeout = 120_000;

  connection.setSessionType('stateful');
  let lockHandle: string | undefined;
  try {
    // 1. Lock (stateful) — response carries LOCK_HANDLE and CORRNR
    const lockResp = await connection.makeAdtRequest({
      url: `${base}?_action=LOCK&accessMode=MODIFY`,
      method: 'POST',
      timeout: 30_000,
      data: null,
      headers: { Accept: LOCK_ACCEPT },
    });
    const xml =
      typeof lockResp.data === 'string' ? lockResp.data : String(lockResp.data);
    lockHandle = xml.match(/<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/)?.[1];
    if (!lockHandle) {
      throw new Error(
        `Lock failed for ${name} (no LOCK_HANDLE): ${xml.slice(0, 300)}`,
      );
    }
    const corrNr =
      xml.match(/<CORRNR>([^<]*)<\/CORRNR>/)?.[1] ?? transport ?? '';
    logger?.info(
      `updateInPlace: ${name} locked (corrNr=${corrNr || '(none)'})`,
    );

    // 2. Write source (stateless is fine after the lock; always send corrNr)
    connection.setSessionType('stateless');
    const put = await connection.makeAdtRequest({
      url: `${base}/source/main?lockHandle=${encodeURIComponent(lockHandle)}&corrNr=${encodeURIComponent(corrNr)}`,
      method: 'PUT',
      timeout,
      data: source,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Accept: 'text/plain',
      },
    });
    if (put.status >= 400) {
      const body =
        typeof put.data === 'string'
          ? put.data.slice(0, 300)
          : String(put.data).slice(0, 300);
      throw new Error(`Update ${name} failed (HTTP ${put.status}): ${body}`);
    }
    logger?.info(`updateInPlace: ${name} source updated`);
  } catch (err: any) {
    const d = describeAdtError(err).toLowerCase();
    if (d.includes('lock') || d.includes('锁定')) {
      throw new Error(
        `Cannot update ${name}: the object is already locked (open SE24/SE80 editor or a lock entry in a transport request). ` +
          `Release the lock (SE03 → unlock objects, or save/close the editor), then retry. Detail: ${describeAdtError(err)}`,
      );
    }
    throw new Error(describeAdtError(err));
  } finally {
    // 3. Unlock (stateful) — never leak a lock silently
    connection.setSessionType('stateful');
    try {
      if (lockHandle) {
        await connection.makeAdtRequest({
          url: `${base}?_action=UNLOCK&lockHandle=${encodeURIComponent(lockHandle)}`,
          method: 'POST',
          timeout: 30_000,
          data: null,
          headers: { Accept: LOCK_ACCEPT },
        });
        logger?.info(`updateInPlace: ${name} unlocked`);
      }
    } catch (unlockErr) {
      logger?.warn(
        `⚠️  FAILED to unlock ${name} (lock may be left behind — release in SE03): ${describeAdtError(unlockErr)}`,
      );
    }
    connection.setSessionType('stateless');
  }
}

async function deployClassObject(
  context: HandlerContext,
  name: string,
  source: string,
  pkg: string,
  transport: string | undefined,
): Promise<DeployResult> {
  const { connection, logger } = context;
  const client = createAdtClient(connection, logger);
  const adtClass = client.getClass();
  try {
    await adtClass.create(
      {
        className: name,
        packageName: pkg,
        transportRequest: transport,
        description: `MCP in-system customizing engine (v${ENGINE_VERSION})`,
        sourceCode: source,
      },
      { activateOnCreate: false },
    );
    logger?.info(`Engine class created: ${name}`);
    await adtClass.activate({ className: name });
    return { created: true, activated: true };
  } catch (err: any) {
    const detail = describeAdtError(err);
    const msg = (err?.message ?? String(err)).toLowerCase();
    const detailLower = detail.toLowerCase();
    const exists =
      msg.includes('already exist') ||
      detailLower.includes('already exist') ||
      detailLower.includes('does already exist') ||
      detailLower.includes('exceptionresourcealreadyexists') ||
      detailLower.includes('resourcealreadyexists') ||
      detailLower.includes('已存在');
    if (!exists) rethrowDetailed(err);
    // Update-in-place with explicit corrNr (this SAP rejects source PUT without it).
    logger?.info(`Engine class exists, updating in place: ${name}`);
    await updateInPlace(context, 'class', name, source, transport);
    await adtClass.activate({ className: name }).catch(rethrowDetailed);
    return { created: false, activated: true };
  }
}

async function deployReportObject(
  context: HandlerContext,
  name: string,
  source: string,
  pkg: string,
  transport: string | undefined,
): Promise<DeployResult> {
  const { connection, logger } = context;
  const client = createAdtClient(connection, logger);
  const program = client.getProgram();
  try {
    await program.create(
      {
        programName: name,
        packageName: pkg,
        transportRequest: transport,
        description: `MCP customizing engine background writer (v${ENGINE_VERSION})`,
        sourceCode: source,
      },
      { activateOnCreate: false },
    );
    logger?.info(`Engine report created: ${name}`);
    await program.activate({ programName: name });
    return { created: true, activated: true };
  } catch (err: any) {
    const detail = describeAdtError(err);
    const msg = (err?.message ?? String(err)).toLowerCase();
    const detailLower = detail.toLowerCase();
    const exists =
      msg.includes('already exist') ||
      detailLower.includes('already exist') ||
      detailLower.includes('does already exist') ||
      detailLower.includes('exceptionresourcealreadyexists') ||
      detailLower.includes('resourcealreadyexists') ||
      detailLower.includes('已存在');
    if (!exists) rethrowDetailed(err);
    // Update-in-place with explicit corrNr (same rationale as the class path).
    logger?.info(`Engine report exists, updating in place: ${name}`);
    await updateInPlace(context, 'report', name, source, transport);
    await program.activate({ programName: name }).catch(rethrowDetailed);
    return { created: false, activated: true };
  }
}

export async function deployClass(
  context: HandlerContext,
  name: string,
  source: string,
  opts: DeployOptions = {},
): Promise<DeployResult> {
  return deployClassObject(
    context,
    name,
    source,
    (opts.package_name ?? '$TMP').toUpperCase(),
    opts.transport_request?.trim().toUpperCase(),
  );
}

export async function deployReport(
  context: HandlerContext,
  name: string,
  source: string,
  opts: DeployOptions = {},
): Promise<DeployResult> {
  return deployReportObject(
    context,
    name,
    source,
    (opts.package_name ?? '$TMP').toUpperCase(),
    opts.transport_request?.trim().toUpperCase(),
  );
}
