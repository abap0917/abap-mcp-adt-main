"use strict";
/**
 * CustomizingDiff / CustomizingPlanChange — compare configuration between two
 * org-unit key values, and dry-run the rows a copy would write.
 *
 * Ported from abap-config-mcp.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITIONS = void 0;
exports.handleCustomizingDiff = handleCustomizingDiff;
exports.handleCustomizingPlanChange = handleCustomizingPlanChange;
const resolveMaint_1 = require("../../../lib/customizing/resolveMaint");
const utils_1 = require("../../../lib/utils");
const diffTool = {
    name: 'CustomizingDiff',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Compare customizing rows between two org-unit key values of the same config object (e.g. company code 1000 vs 2000).',
    inputSchema: {
        type: 'object',
        properties: {
            object_name: {
                type: 'string',
                description: 'Maintenance view or base table, e.g. T001 / V_T001.',
            },
            key_field: {
                type: 'string',
                description: 'Org-unit key field, e.g. BUKRS, WERKS, VKORG.',
            },
            source_key: {
                type: 'string',
                description: 'Source org-unit value (e.g. "1000").',
            },
            target_key: {
                type: 'string',
                description: 'Target org-unit value (e.g. "2000").',
            },
        },
        required: ['object_name', 'key_field', 'source_key', 'target_key'],
    },
};
const planTool = {
    name: 'CustomizingPlanChange',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Dry-run plan of a config copy: the exact rows that would be written when copying sourceKey → targetKey (with optional field overrides). Nothing is written.',
    inputSchema: {
        type: 'object',
        properties: {
            object_name: {
                type: 'string',
                description: 'Maintenance view or base table.',
            },
            key_field: { type: 'string', description: 'Org-unit key field.' },
            source_key: { type: 'string', description: 'Source org-unit value.' },
            target_key: { type: 'string', description: 'Target org-unit value.' },
            values: {
                type: 'array',
                description: 'Optional [{field, value}] overrides applied to every planned row.',
                items: {
                    type: 'object',
                    properties: { field: { type: 'string' }, value: { type: 'string' } },
                    required: ['field', 'value'],
                },
            },
        },
        required: ['object_name', 'key_field', 'source_key', 'target_key'],
    },
};
function rowKey(row, nonOrgFields) {
    return nonOrgFields.map((f) => row[f] ?? '').join('|');
}
function formatRows(rows) {
    if (rows.length === 0)
        return '(none)';
    const cols = Object.keys(rows[0]);
    const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => (r[c] ?? '').length)));
    const lines = [
        cols.map((c, i) => c.padEnd(widths[i])).join(' '),
        '-'.repeat(widths.reduce((a, b) => a + b + 1, 0)),
    ];
    for (const r of rows) {
        lines.push(cols.map((c, i) => (r[c] ?? '').slice(0, 40).padEnd(widths[i])).join(' '));
    }
    return lines.join('\n');
}
async function loadSides(context, args) {
    const { connection, logger } = context;
    const table = args.object_name.toUpperCase().replace(/'/g, "''");
    const kf = args.key_field.toUpperCase().replace(/'/g, "''");
    const src = args.source_key.replace(/'/g, "''");
    const tgt = args.target_key.replace(/'/g, "''");
    const baseTable = await (0, resolveMaint_1.resolveBaseTable)(connection, logger, table);
    const [srcRows, tgtRows] = await Promise.all([
        (0, resolveMaint_1.loadRowsFor)(connection, logger, baseTable, kf, src),
        (0, resolveMaint_1.loadRowsFor)(connection, logger, baseTable, kf, tgt),
    ]);
    return { baseTable, kf, src, tgt, srcRows, tgtRows };
}
async function handleCustomizingDiff(context, args) {
    const { logger } = context;
    try {
        if (!args?.object_name ||
            !args.key_field ||
            !args.source_key ||
            !args.target_key) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'object_name, key_field, source_key, target_key are required');
        }
        const { baseTable, kf, src, tgt, srcRows, tgtRows } = await loadSides(context, args);
        const allFields = [
            ...new Set([
                ...Object.keys(srcRows[0] ?? {}),
                ...Object.keys(tgtRows[0] ?? {}),
            ]),
        ];
        const nonOrgFields = allFields.filter((f) => f !== kf && f !== 'MANDT');
        const srcIndex = new Map(srcRows.map((r) => [rowKey(r, nonOrgFields), r]));
        const tgtIndex = new Map(tgtRows.map((r) => [rowKey(r, nonOrgFields), r]));
        const onlyInSrc = srcRows.filter((r) => !tgtIndex.has(rowKey(r, nonOrgFields)));
        const onlyInTgt = tgtRows.filter((r) => !srcIndex.has(rowKey(r, nonOrgFields)));
        const inBoth = srcRows.filter((r) => tgtIndex.has(rowKey(r, nonOrgFields)));
        const lines = [
            `CustomizingDiff ${baseTable}  ${kf} = '${src}'  vs  '${tgt}'`,
            '',
            `Only in ${src} (would be copied): ${onlyInSrc.length}`,
            formatRows(onlyInSrc.map((r) => ({ ...r, [kf]: `${r[kf]} → ${tgt}` }))),
            '',
            `Only in ${tgt} (unaffected): ${onlyInTgt.length}`,
            formatRows(onlyInTgt),
            '',
            `Identical in both: ${inBoth.length}`,
        ];
        return {
            isError: false,
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('CustomizingDiff failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
async function handleCustomizingPlanChange(context, args) {
    const { logger } = context;
    try {
        if (!args?.object_name ||
            !args.key_field ||
            !args.source_key ||
            !args.target_key) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'object_name, key_field, source_key, target_key are required');
        }
        const { baseTable, kf, tgt, srcRows } = await loadSides(context, args);
        const overrides = new Map((args.values ?? []).map((v) => [
            v.field.toUpperCase().replace(/'/g, "''"),
            v.value,
        ]));
        const planned = srcRows.map((r) => {
            const row = { ...r, [kf]: tgt };
            for (const [f, v] of overrides)
                row[f] = v;
            return row;
        });
        const lines = [
            `CustomizingPlanChange ${baseTable}  ${kf} '${args.source_key}' → '${tgt}'  (dry run, nothing written)`,
            '',
            `Rows that would be written: ${planned.length}`,
            formatRows(planned),
            '',
            planned.length > 0
                ? 'Re-run with CustomizingApply (commit: true) + a Customizing transport to apply.'
                : 'Nothing to plan — source has no rows for this key.',
        ];
        return {
            isError: false,
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('CustomizingPlanChange failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
exports.TOOL_DEFINITIONS = [diffTool, planTool];
//# sourceMappingURL=handleCustomizingCompare.js.map