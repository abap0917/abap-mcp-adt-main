"use strict";
/**
 * Customizing engine lifecycle tools:
 *   CustomizingEngineBootstrap — deploy/update the ABAP engine (class + writer
 *     report + optional DIAG class) and activate, using the server's own
 *     create/write/activate tooling.
 *   CustomizingEnginePing     — version handshake + client change/transport
 *     capability + environment probe.
 *   CustomizingEngineSelftest — non-destructive engine validation
 *     (autoDeploy: true by default — redeploys if stale).
 *   CustomizingEngineCleanup  — delete the engine objects.
 *
 * Ported from abap-config-mcp. SICF node registration (/sap/bc/zmcp_cust,
 * /sap/bc/zmcp_diag) is a one-time BASIS step — see the bootstrap output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.handleCustomizingEngineBootstrap = handleCustomizingEngineBootstrap;
exports.handleCustomizingEnginePing = handleCustomizingEnginePing;
exports.handleCustomizingEngineSelftest = handleCustomizingEngineSelftest;
exports.handleCustomizingEngineCleanup = handleCustomizingEngineCleanup;
const engineMeta_js_1 = require("../../../abap/engineMeta.js");
const clients_js_1 = require("../../../lib/clients.js");
const deployEngine_js_1 = require("../../../lib/customizing/deployEngine.js");
const engineClient_js_1 = require("../../../lib/customizing/engineClient.js");
const ensureEngine_js_1 = require("../../../lib/customizing/ensureEngine.js");
const bootstrapTool = {
    name: 'CustomizingEngineBootstrap',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Deploy/update the in-system customizing engine into SAP: class ZCL_MCP_CUST_ENGINE + writer report ZMCP_CUST_WRITE (and optionally ZCL_MCP_DIAG), then activate. SICF nodes must be registered once by BASIS (see output). Bump ENGINE_VERSION on ABAP changes for auto-deploy.',
    inputSchema: {
        type: 'object',
        properties: {
            package_name: {
                type: 'string',
                description: 'ABAP package (default $TMP; use a Z package + transport for CTS).',
                default: '$TMP',
            },
            transport_request: {
                type: 'string',
                description: 'Transport request (required for transportable packages).',
            },
            deploy_diag: {
                type: 'boolean',
                description: 'Also deploy the read-only DIAG engine class (default true).',
                default: true,
            },
        },
        required: [],
    },
};
const pingTool = {
    name: 'CustomizingEnginePing',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Ping the deployed customizing engine: version handshake, client change/transport capability (T000/SCC4) and environment probe (SID, release, S/4, org-copy availability).',
    inputSchema: { type: 'object', properties: {} },
};
const selftestTool = {
    name: 'CustomizingEngineSelftest',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Non-destructive engine self-test (dynamic typing, sample read, TABKEY build; with a transport, simulates recording). autoDeploy (default true) redeploys the engine if the deployed version is stale.',
    inputSchema: {
        type: 'object',
        properties: {
            table: {
                type: 'string',
                description: 'Sample table (default TCURR).',
                default: 'TCURR',
            },
            transport: {
                type: 'string',
                description: 'Optional transport request to simulate recording.',
            },
            auto_deploy: {
                type: 'boolean',
                description: 'Redeploy the engine if stale (default true).',
                default: true,
            },
        },
        required: [],
    },
};
const cleanupTool = {
    name: 'CustomizingEngineCleanup',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Delete the customizing engine objects (class ZCL_MCP_CUST_ENGINE, report ZMCP_CUST_WRITE, optional ZCL_MCP_DIAG). SICF nodes must be removed manually.',
    inputSchema: {
        type: 'object',
        properties: {
            remove_diag: {
                type: 'boolean',
                description: 'Also delete the DIAG class (default true).',
                default: true,
            },
        },
        required: [],
    },
};
async function handleCustomizingEngineBootstrap(context, args) {
    const { connection, logger } = context;
    try {
        const opts = {
            package_name: args.package_name ?? '$TMP',
            transport_request: args.transport_request,
        };
        const deployDiag = args.deploy_diag !== false;
        let engineSource;
        let writerSource;
        let diagSource;
        try {
            engineSource = (0, engineMeta_js_1.getEngineSource)();
            writerSource = (0, engineMeta_js_1.getWriterSource)();
            diagSource = deployDiag ? (0, engineMeta_js_1.getDiagSource)() : undefined;
        }
        catch (err) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `ABAP sources not found: ${err.message}\nSet ABAP_SRC_DIR to the directory holding the .abap files (e.g. the repo src/abap).`,
                    },
                ],
            };
        }
        const lines = [
            `Deploying customizing engine v${engineMeta_js_1.ENGINE_VERSION} to package ${opts.package_name}${opts.transport_request ? ` (transport ${opts.transport_request})` : ''}`,
            '',
        ];
        const eng = await (0, deployEngine_js_1.deployClass)(context, engineMeta_js_1.ENGINE_CLASS_NAME, engineSource, opts);
        lines.push(`✅ ${engineMeta_js_1.ENGINE_CLASS_NAME}  ${eng.created ? 'created' : 'updated in place'} + activated`);
        const rep = await (0, deployEngine_js_1.deployReport)(context, engineMeta_js_1.WRITER_REPORT_NAME, writerSource, opts);
        lines.push(`✅ ${engineMeta_js_1.WRITER_REPORT_NAME}  ${rep.created ? 'created' : 'updated in place'} + activated`);
        if (diagSource) {
            const diag = await (0, deployEngine_js_1.deployClass)(context, engineMeta_js_1.DIAG_CLASS_NAME, diagSource, opts);
            lines.push(`✅ ${engineMeta_js_1.DIAG_CLASS_NAME}  ${diag.created ? 'created' : 'updated in place'} + activated`);
        }
        lines.push('', '⚠️  One-time BASIS step (SICF nodes):', `  Create SICF service ${engineMeta_js_1.ENGINE_ICF_PATH} with handler class ${engineMeta_js_1.ENGINE_CLASS_NAME} (activate it).`, `  Create SICF service ${engineMeta_js_1.DIAG_ICF_PATH} with handler class ${engineMeta_js_1.DIAG_CLASS_NAME} (activate it).`, '', 'Then verify with CustomizingEnginePing.');
        return {
            isError: false,
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('CustomizingEngineBootstrap failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
async function handleCustomizingEnginePing(context) {
    const { connection, logger } = context;
    try {
        const res = await (0, engineClient_js_1.callEngine)(connection, logger, 'ping', {}, 30_000);
        if (res.STATUS === 'error') {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Engine error: ${(res.MESSAGES ?? []).join('; ') || 'unknown'}\n\n` +
                            `Run CustomizingEngineBootstrap to deploy the engine, then register SICF node ${engineMeta_js_1.ENGINE_ICF_PATH} (handler ${engineMeta_js_1.ENGINE_CLASS_NAME}).`,
                    },
                ],
            };
        }
        let env = '';
        try {
            const parsed = res.DATA_JSON ? JSON.parse(res.DATA_JSON) : {};
            env =
                '\n' +
                    Object.entries(parsed)
                        .map(([k, v]) => `  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                        .join('\n');
        }
        catch {
            env = '';
        }
        const text = `✅ Customizing engine reachable\n` +
            `  Version:  ${res.VERSION ?? '?'} (repo expects ${engineMeta_js_1.ENGINE_VERSION})\n` +
            `  Status:   ${res.STATUS}${res.MESSAGES?.length ? ` — ${res.MESSAGES.join('; ')}` : ''}` +
            env;
        return { isError: false, content: [{ type: 'text', text }] };
    }
    catch (error) {
        logger?.error('CustomizingEnginePing failed', error);
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `${String(error?.message ?? error)}\n\n` +
                        `Engine not reachable at ${engineMeta_js_1.ENGINE_ICF_PATH}. Run CustomizingEngineBootstrap to deploy, then register the SICF node (handler ${engineMeta_js_1.ENGINE_CLASS_NAME}).`,
                },
            ],
        };
    }
}
async function handleCustomizingEngineSelftest(context, args) {
    const { connection, logger } = context;
    try {
        const table = (args.table ?? 'TCURR').toUpperCase();
        // autoDeploy gate (aligned with upstream): redeploy if stale, unless disabled.
        let deployNote = '';
        try {
            deployNote = await (0, ensureEngine_js_1.ensureEngine)(context, {
                autoDeploy: args.auto_deploy !== false,
            });
        }
        catch (e) {
            if (args.auto_deploy === false)
                throw e;
            return {
                isError: true,
                content: [{ type: 'text', text: String(e?.message ?? e) }],
            };
        }
        const res = await (0, engineClient_js_1.callEngine)(connection, logger, 'selftest', {
            table,
            transport: args.transport?.trim().toUpperCase(),
        });
        if (res.STATUS === 'error') {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Engine error: ${(res.MESSAGES ?? []).join('; ') || 'unknown'}\nEngine may not be deployed — run CustomizingEngineBootstrap first.`,
                    },
                ],
            };
        }
        const lines = [
            `✅ Engine selftest (${res.VERSION ?? '?'}) on ${table}`,
            `  Status: ${res.STATUS}`,
        ];
        if (res.ROWS_PLANNED !== undefined)
            lines.push(`  Rows planned: ${res.ROWS_PLANNED}`);
        if (res.DATA_JSON)
            lines.push(`  Sample TABKEY: ${res.DATA_JSON}`);
        for (const m of res.MESSAGES ?? [])
            lines.push(`  • ${m}`);
        if (deployNote)
            lines.push(`  ${deployNote}`);
        return {
            isError: false,
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('CustomizingEngineSelftest failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
async function handleCustomizingEngineCleanup(context, args) {
    const { connection, logger } = context;
    try {
        const client = (0, clients_js_1.createAdtClient)(connection, logger);
        const lines = ['Cleaning up customizing engine objects:'];
        const delClass = async (name) => {
            try {
                await client.getClass().delete({ className: name });
                lines.push(`✅ ${name} deleted`);
            }
            catch (e) {
                const msg = (e?.message ?? String(e)).toLowerCase();
                if (msg.includes('not found'))
                    lines.push(`⏭  ${name} not found — nothing to delete`);
                else
                    throw e;
            }
        };
        await delClass(engineMeta_js_1.ENGINE_CLASS_NAME);
        try {
            await client.getProgram().delete({ programName: engineMeta_js_1.WRITER_REPORT_NAME });
            lines.push(`✅ ${engineMeta_js_1.WRITER_REPORT_NAME} deleted`);
        }
        catch (e) {
            const msg = (e?.message ?? String(e)).toLowerCase();
            if (msg.includes('not found'))
                lines.push(`⏭  ${engineMeta_js_1.WRITER_REPORT_NAME} not found — nothing to delete`);
            else
                throw e;
        }
        if (args.remove_diag !== false)
            await delClass(engineMeta_js_1.DIAG_CLASS_NAME);
        lines.push('', `Remove the SICF nodes ${engineMeta_js_1.ENGINE_ICF_PATH} and ${engineMeta_js_1.DIAG_ICF_PATH} manually (transaction SICF).`);
        return {
            isError: false,
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('CustomizingEngineCleanup failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
exports.TOOL_DEFINITIONS = [
    bootstrapTool,
    pingTool,
    selftestTool,
    cleanupTool,
];
//# sourceMappingURL=handleEngineLifecycle.js.map