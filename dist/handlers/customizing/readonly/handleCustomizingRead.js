"use strict";
/**
 * CustomizingRead — read customizing rows for an org-unit key (or first N rows).
 *
 * Ported from abap-config-mcp (formatQueryResult-style output).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleCustomizingRead = handleCustomizingRead;
const resolveMaint_1 = require("../../../lib/customizing/resolveMaint");
const runSql_1 = require("../../../lib/customizing/runSql");
const utils_1 = require("../../../lib/utils");
exports.TOOL_DEFINITION = {
    name: 'CustomizingRead',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Read current customizing data for a config object (maintenance view or table), optionally filtered by an org-unit key field value.',
    inputSchema: {
        type: 'object',
        properties: {
            object_name: {
                type: 'string',
                description: 'Maintenance view or base table, e.g. V_T001 / T001 / V_T001W.',
            },
            key_field: {
                type: 'string',
                description: 'Key field to filter on (e.g. BUKRS, WERKS, VKORG). Omit to read the first rows.',
            },
            key_value: {
                type: 'string',
                description: 'Key field value to filter on (e.g. "1000").',
            },
            max_rows: {
                type: 'number',
                description: 'Maximum rows (default 100).',
                default: 100,
            },
        },
        required: ['object_name'],
    },
};
function formatQueryResult(rows, maxRows) {
    if (rows.length === 0)
        return '(0 rows)';
    const cols = Object.keys(rows[0]);
    const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => (r[c] ?? '').length)));
    const lines = [];
    lines.push(cols.map((c, i) => c.padEnd(widths[i])).join(' '));
    lines.push(widths.map((w) => '-'.repeat(w)).join('-+-'));
    for (const r of rows) {
        lines.push(cols.map((c, i) => (r[c] ?? '').slice(0, 50).padEnd(widths[i])).join(' '));
    }
    lines.push(`(${rows.length} row(s), capped at ${maxRows})`);
    return lines.join('\n');
}
async function handleCustomizingRead(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.object_name) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'object_name is required');
        }
        const max = args.max_rows ?? 100;
        const table = args.object_name.toUpperCase().replace(/'/g, "''");
        const baseTable = await (0, resolveMaint_1.resolveBaseTable)(connection, logger, table);
        let whereClause = '';
        if (args.key_field && args.key_value !== undefined) {
            const kf = args.key_field.toUpperCase().replace(/'/g, "''");
            const kv = args.key_value.replace(/'/g, "''");
            whereClause = ` WHERE ${kf} = '${kv}'`;
        }
        const rows = await (0, runSql_1.runSql)(connection, logger, `SELECT * FROM ${baseTable}${whereClause}`, max);
        const header = whereClause
            ? `Customizing: ${baseTable}  WHERE ${whereClause.trim().replace(/^WHERE /, '')}\n\n`
            : `Customizing: ${baseTable}  (first ${max} rows)\n\n`;
        const text = header + formatQueryResult(rows, max);
        return { isError: false, content: [{ type: 'text', text }] };
    }
    catch (error) {
        logger?.error('CustomizingRead failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
//# sourceMappingURL=handleCustomizingRead.js.map