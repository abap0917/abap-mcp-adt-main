"use strict";
/**
 * In-system engine ICF client — JSON protocol between the MCP server and the
 * ABAP handlers deployed at /sap/bc/zmcp_cust (customizing engine) and
 * /sap/bc/zmcp_diag (read-only diagnostic engine).
 *
 * Ported from abap-config-mcp. Request JSON uses lowercase keys (ABAP
 * /ui2/cl_json deserialises case-insensitively); the response uses UPPERCASE
 * keys (serialised by /ui2/cl_json with pretty_mode none).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.callEngine = callEngine;
exports.callDiag = callDiag;
const engineMeta_1 = require("../../abap/engineMeta");
const JSON_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
};
async function callIcf(connection, logger, path, operation, req, timeoutMs) {
    const body = JSON.stringify({ operation, ...req });
    logger?.info(`[customizing] engine call ${path} op=${operation}`);
    const resp = await connection.makeAdtRequest({
        url: path,
        method: 'POST',
        timeout: timeoutMs,
        data: body,
        headers: JSON_HEADERS,
    });
    let data = resp.data;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        }
        catch {
            throw new Error(`Engine returned non-JSON (HTTP ${resp.status}): ${String(data).slice(0, 400)}`);
        }
    }
    if (!data || typeof data !== 'object') {
        throw new Error(`Engine returned empty/invalid payload (HTTP ${resp.status})`);
    }
    const out = data;
    if (!out.STATUS && resp.status !== 200) {
        throw new Error(`Engine HTTP ${resp.status}: ${String(resp.data).slice(0, 400)}`);
    }
    return out;
}
/** POST a JSON request to the customizing engine (writes / IMG index reads). */
function callEngine(connection, logger, operation, req = {}, timeoutMs = 600_000) {
    return callIcf(connection, logger, engineMeta_1.ENGINE_ICF_PATH, operation, req, timeoutMs);
}
/** POST a JSON request to the Tier-0 diagnostic engine. */
function callDiag(connection, logger, operation, req = {}, timeoutMs = 30_000) {
    return callIcf(connection, logger, engineMeta_1.DIAG_ICF_PATH, operation, req, timeoutMs);
}
//# sourceMappingURL=engineClient.js.map