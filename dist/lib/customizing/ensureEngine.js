"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureEngine = ensureEngine;
const engineMeta_js_1 = require("../../abap/engineMeta.js");
const deployEngine_js_1 = require("./deployEngine.js");
const engineClient_js_1 = require("./engineClient.js");
const SOURCE_ACCEPT = 'application/vnd.sap.adt.abapsource.v1+xml';
async function readClassVersion(context) {
    const { connection, logger } = context;
    try {
        const resp = await connection.makeAdtRequest({
            url: `${engineMeta_js_1.ENGINE_CLASS_URL}/source/main`,
            method: 'GET',
            timeout: 30_000,
            headers: { Accept: SOURCE_ACCEPT },
        });
        const xml = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
        // c_version is a CONSTANTS string literal; tolerate pretty-printer reflow.
        const m = xml.match(/c_version\b[\s\S]*?VALUE\s+'([^']+)'/i);
        return m ? m[1] : null;
    }
    catch {
        return null; // class missing / not readable
    }
}
async function reportExists(context) {
    const { connection } = context;
    try {
        const resp = await connection.makeAdtRequest({
            url: `${engineMeta_js_1.WRITER_REPORT_URL}/source/main`,
            method: 'GET',
            timeout: 30_000,
            headers: { Accept: SOURCE_ACCEPT },
        });
        return resp.status === 200;
    }
    catch {
        return false;
    }
}
async function pingEngine(context) {
    try {
        return await (0, engineClient_js_1.callEngine)(context.connection, context.logger, 'ping', {}, 15_000);
    }
    catch {
        return null;
    }
}
function sicfGuidance() {
    return (`Customizing engine ABAP objects are in place, but the ICF service is not reachable at ${engineMeta_js_1.ENGINE_ICF_PATH}. ` +
        `Register + activate the SICF node in transaction SICF (handler class ${engineMeta_js_1.ENGINE_CLASS_NAME}), then retry.`);
}
/**
 * Ensure the customizing engine is deployed and reachable before a write.
 * @returns a human-readable note of what was done ('' when already fresh).
 */
async function ensureEngine(context, opts = {}) {
    if (opts.autoDeploy === false)
        return '';
    const { logger } = context;
    // Fast path: engine reachable and version fresh.
    let ping = await pingEngine(context);
    if (ping?.STATUS === 'ok' && ping.VERSION === engineMeta_js_1.ENGINE_VERSION)
        return '';
    // Determine staleness from the deployed class source.
    const deployedVersion = await readClassVersion(context);
    const writerOk = await reportExists(context);
    const needsDeploy = deployedVersion !== engineMeta_js_1.ENGINE_VERSION || !writerOk;
    if (!needsDeploy && ping) {
        // Version fresh, but ping failed → SICF problem.
        throw new Error(sicfGuidance());
    }
    if (!needsDeploy && !ping) {
        // Version fresh but engine unreachable and class readable → SICF problem.
        throw new Error(sicfGuidance());
    }
    // Deploy (or update-in-place) the engine class + writer report.
    logger?.info(`ensureEngine: deploying engine (class v=${deployedVersion ?? 'missing'}, writer=${writerOk ? 'ok' : 'missing'})`);
    let engineSource;
    let writerSource;
    try {
        engineSource = (0, engineMeta_js_1.getEngineSource)();
        writerSource = (0, engineMeta_js_1.getWriterSource)();
    }
    catch (err) {
        throw new Error(`ABAP sources not found: ${err.message}\nSet ABAP_SRC_DIR to the directory holding the .abap files.`);
    }
    const notes = [];
    let cls;
    let rep;
    try {
        cls = await (0, deployEngine_js_1.deployClass)(context, engineMeta_js_1.ENGINE_CLASS_NAME, engineSource, opts);
        notes.push(`${engineMeta_js_1.ENGINE_CLASS_NAME} ${cls.created ? 'created' : 'updated in place'} + activated`);
        rep = await (0, deployEngine_js_1.deployReport)(context, engineMeta_js_1.WRITER_REPORT_NAME, writerSource, opts);
        notes.push(`${engineMeta_js_1.WRITER_REPORT_NAME} ${rep.created ? 'created' : 'updated in place'} + activated`);
    }
    catch (err) {
        // The engine is functional (ping succeeded) but the ABAP objects are
        // locked (open SE24/SE80 editor or a lock entry in a transport request).
        // Don't block the write on a cosmetic redeploy — warn and proceed.
        const detail = String(err?.message ?? err).toLowerCase();
        const locked = detail.includes('lock') || detail.includes('锁定');
        if (ping?.STATUS === 'ok' && locked) {
            logger?.warn(`ensureEngine: redeploy skipped (object locked): ${err.message}`);
            return `autoDeploy skipped: engine objects are locked (${err.message}) — release the lock (SE03 → unlock objects, close the SE24/SE80 editor) to let autoDeploy refresh the version. Engine v${ping.VERSION} is functional.`;
        }
        throw err;
    }
    // Re-ping to confirm end-to-end (ABAP objects + SICF).
    ping = await pingEngine(context);
    if (!ping || ping.STATUS !== 'ok') {
        throw new Error(sicfGuidance());
    }
    if (ping.VERSION !== engineMeta_js_1.ENGINE_VERSION) {
        logger?.warn(`ensureEngine: deployed version ${ping.VERSION} ≠ repo ${engineMeta_js_1.ENGINE_VERSION}`);
    }
    return `autoDeploy: ${notes.join('; ')}; engine v${ping.VERSION} reachable.`;
}
//# sourceMappingURL=ensureEngine.js.map