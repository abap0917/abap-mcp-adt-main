"use strict";
/**
 * OrgCopy — headless copy (or delete) of an organizational unit and its
 * EC01-style dependent customizing, via the engine's org_copy op (ECOP
 * entity copier in the dark).
 *
 * Ported from abap-config-mcp. Requires the ECOP entity copier available on the
 * box (S/4HANA org-unit domains); the engine ping reports HAS_ORG_COPY.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleOrgCopy = handleOrgCopy;
const engineClient_1 = require("../../../lib/customizing/engineClient");
const ensureEngine_1 = require("../../../lib/customizing/ensureEngine");
const transportGovernance_1 = require("../../../lib/customizing/transportGovernance");
const utils_1 = require("../../../lib/utils");
exports.TOOL_DEFINITION = {
    name: 'OrgCopy',
    available_in: ['onprem'],
    description: '[customizing] Headless copy of an organizational unit (company code, plant, sales org, …) and its dependent customizing — the "org units in the dark" copier (EC01-style). Records on a Customizing transport the governed way. DRY RUN by default; commit: true applies.',
    inputSchema: {
        type: 'object',
        properties: {
            org_unit: {
                type: 'string',
                enum: [
                    'BUKRS',
                    'WERKS',
                    'CACCD',
                    'VKORG',
                    'VTWEG',
                    'SPART',
                    'VSTEL',
                    'LGNUM',
                    'EKORG',
                    'LGORT',
                    'MTART',
                ],
                description: 'Org-unit type/domain to copy (BUKRS = company code, WERKS = plant, …).',
            },
            source_key: { type: 'string', description: 'Source org-unit value.' },
            target_key: {
                type: 'string',
                description: 'Target org-unit value (must not exist for copy).',
            },
            action: {
                type: 'string',
                enum: ['COPY', 'DELE'],
                description: 'COPY (default) or DELE.',
                default: 'COPY',
            },
            commit: {
                type: 'boolean',
                description: 'Apply (false = dry run).',
                default: false,
            },
            transport: {
                type: 'string',
                description: 'Customizing transport request or task.',
            },
            create_transport: {
                type: 'boolean',
                description: 'Engine creates + names its own request.',
                default: false,
            },
            no_transport: {
                type: 'boolean',
                description: 'Copy WITHOUT a transport request (skips transport governance; engine routes by client capability — non-recording client → no transport recording). Dev/test only.',
                default: false,
            },
            auto_deploy: {
                type: 'boolean',
                description: 'Redeploy the engine if missing or stale before copying (default true).',
                default: true,
            },
            package_name: {
                type: 'string',
                description: 'ABAP package used only when auto_deploy redeploys (default $TMP).',
                default: '$TMP',
            },
            transport_request: {
                type: 'string',
                description: 'Transport request used only when auto_deploy redeploys (for transportable packages).',
            },
        },
        required: ['org_unit', 'source_key', 'target_key'],
    },
};
async function handleOrgCopy(context, args) {
    const { connection, logger } = context;
    try {
        for (const k of ['org_unit', 'source_key', 'target_key']) {
            if (!args?.[k])
                throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, `${k} is required`);
        }
        const action = args.action ?? 'COPY';
        const commit = args.commit === true;
        // autoDeploy gate (aligned with upstream).
        let deployNote = '';
        try {
            deployNote = await (0, ensureEngine_1.ensureEngine)(context, {
                autoDeploy: args.auto_deploy !== false,
                package_name: args.package_name,
                transport_request: args.transport_request,
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
        let decision;
        if (args.no_transport) {
            decision = { kind: 'direct' };
        }
        else {
            const d = await (0, transportGovernance_1.resolveTransport)(connection, logger, { transport: args.transport, createTransport: args.create_transport }, `MCP org copy ${args.org_unit} ${args.source_key}->${args.target_key}`);
            if (d.kind === 'prompt') {
                return {
                    isError: false,
                    content: [{ type: 'text', text: d.prompt }],
                };
            }
            decision = { kind: d.kind, transport: d.transport };
        }
        const req = {
            org_unit: args.org_unit.toUpperCase(),
            source_key: args.source_key,
            target_key: args.target_key,
            action,
            commit: commit ? 'X' : '',
        };
        if (decision.transport)
            req.transport = decision.transport;
        if (decision.kind === 'create')
            req.create_transport = 'X';
        const res = await (0, engineClient_1.callEngine)(connection, logger, 'org_copy', req);
        const lines = [
            `${res.STATUS === 'ok' ? '✅' : res.STATUS === 'pending' ? '⏳' : '❌'} Org ${action === 'DELE' ? 'delete' : 'copy'} ${args.org_unit} ${args.source_key}->${args.target_key} (engine ${res.VERSION ?? '?'})`,
        ];
        if (res.DRY_RUN === 'X')
            lines.push('  Dry run — nothing written (re-run with commit: true)');
        if (res.ROWS_PLANNED !== undefined)
            lines.push(`  Rows planned: ${res.ROWS_PLANNED}`);
        if (res.ROWS_WRITTEN !== undefined)
            lines.push(`  Rows written: ${res.ROWS_WRITTEN}`);
        if (res.TRANSPORT)
            lines.push(`  Transport: ${res.TRANSPORT}`);
        if (res.RUN_ID) {
            lines.push(`  Run id: ${res.RUN_ID}`);
            lines.push('  Commit still running — poll with CustomizingStatus (run_id)');
        }
        for (const m of res.MESSAGES ?? [])
            lines.push(`  • ${m}`);
        if (res.STATUS === 'error') {
            lines.push('', 'Note: org copy requires the ECOP entity copier (S/4HANA) — check CustomizingEnginePing for HAS_ORG_COPY.');
        }
        if (deployNote)
            lines.push('', deployNote);
        return {
            isError: res.STATUS === 'error',
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('OrgCopy failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
//# sourceMappingURL=handleOrgCopy.js.map