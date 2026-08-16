"use strict";
/**
 * HanaMemoryReport / AbapMemoryReport — system memory diagnostics via the
 * Tier-0 diagnostic engine (ZCL_MCP_DIAG at /sap/bc/zmcp_diag).
 *
 * Ported from abap-config-mcp. Requires the DIAG engine deployed + SICF node
 * registered; read-only and safe for production.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.handleHanaMemoryReport = handleHanaMemoryReport;
exports.handleAbapMemoryReport = handleAbapMemoryReport;
const engineMeta_1 = require("../../../abap/engineMeta");
const engineClient_1 = require("../../../lib/customizing/engineClient");
const hanaTool = {
    name: 'HanaMemoryReport',
    available_in: ['onprem'],
    description: '[runtime] HANA memory report (host / service / heap / column-store / SQL plan cache) via the deployed diagnostic engine. Read-only.',
    inputSchema: { type: 'object', properties: {} },
};
const abapTool = {
    name: 'AbapMemoryReport',
    available_in: ['onprem', 'legacy'],
    description: '[runtime] ABAP work process memory report (profile parameters + live usage) via the deployed diagnostic engine. Read-only.',
    inputSchema: { type: 'object', properties: {} },
};
async function runReport(context, operation, engineName, minVersion) {
    const { connection, logger } = context;
    try {
        const res = await (0, engineClient_1.callDiag)(connection, logger, operation);
        if (res.STATUS === 'error') {
            const msg = (res.MESSAGES ?? []).join('; ') || 'engine error';
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Engine error: ${msg}\nDeploy the DIAG engine (engine version ≥ ${minVersion}) and register SICF node ${engineMeta_1.DIAG_ICF_PATH}.`,
                    },
                ],
            };
        }
        let data = [];
        try {
            data = res.DATA_JSON ? JSON.parse(res.DATA_JSON) : [];
        }
        catch {
            data = [];
        }
        const text = `${engineName} (engine ${res.VERSION ?? '?'})\n\n` +
            (data.length ? data.join('\n') : '(no data)');
        return { isError: false, content: [{ type: 'text', text }] };
    }
    catch (error) {
        logger?.error(`${engineName} failed`, error);
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `${String(error?.message ?? error)}\n\n` +
                        `The diagnostic engine is not reachable at ${engineMeta_1.DIAG_ICF_PATH}. ` +
                        `Deploy it with CustomizingEngineBootstrap (deploy_diag: true) and register the SICF node, then retry.`,
                },
            ],
        };
    }
}
async function handleHanaMemoryReport(context) {
    return runReport(context, 'hana_memory', 'HANA Memory Report', '0.9.8');
}
async function handleAbapMemoryReport(context) {
    return runReport(context, 'abap_memory', 'ABAP Memory Report', '0.9.16');
}
exports.TOOL_DEFINITIONS = [hanaTool, abapTool];
//# sourceMappingURL=handleMemoryReport.js.map