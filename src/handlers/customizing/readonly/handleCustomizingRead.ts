/**
 * CustomizingRead — read customizing rows for an org-unit key (or first N rows).
 *
 * Ported from abap-config-mcp (formatQueryResult-style output).
 */

import { resolveBaseTable } from '../../../lib/customizing/resolveMaint';
import { col, runSql } from '../../../lib/customizing/runSql';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { ErrorCode, McpError } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CustomizingRead',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[customizing] Read current customizing data for a config object (maintenance view or table), optionally filtered by an org-unit key field value.',
  inputSchema: {
    type: 'object',
    properties: {
      object_name: {
        type: 'string',
        description:
          'Maintenance view or base table, e.g. V_T001 / T001 / V_T001W.',
      },
      key_field: {
        type: 'string',
        description:
          'Key field to filter on (e.g. BUKRS, WERKS, VKORG). Omit to read the first rows.',
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
} as const;

interface ReadArgs {
  object_name: string;
  key_field?: string;
  key_value?: string;
  max_rows?: number;
}

function formatQueryResult(
  rows: Array<Record<string, string>>,
  maxRows: number,
): string {
  if (rows.length === 0) return '(0 rows)';
  const cols = Object.keys(rows[0]);
  const widths = cols.map((c) =>
    Math.max(c.length, ...rows.map((r) => (r[c] ?? '').length)),
  );
  const lines: string[] = [];
  lines.push(cols.map((c, i) => c.padEnd(widths[i])).join(' '));
  lines.push(widths.map((w) => '-'.repeat(w)).join('-+-'));
  for (const r of rows) {
    lines.push(
      cols.map((c, i) => (r[c] ?? '').slice(0, 50).padEnd(widths[i])).join(' '),
    );
  }
  lines.push(`(${rows.length} row(s), capped at ${maxRows})`);
  return lines.join('\n');
}

export async function handleCustomizingRead(
  context: HandlerContext,
  args: ReadArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'object_name is required');
    }
    const max = args.max_rows ?? 100;
    const table = args.object_name.toUpperCase().replace(/'/g, "''");

    const baseTable = await resolveBaseTable(connection, logger, table);

    let whereClause = '';
    if (args.key_field && args.key_value !== undefined) {
      const kf = args.key_field.toUpperCase().replace(/'/g, "''");
      const kv = args.key_value.replace(/'/g, "''");
      whereClause = ` WHERE ${kf} = '${kv}'`;
    }

    const rows = await runSql(
      connection,
      logger,
      `SELECT * FROM ${baseTable}${whereClause}`,
      max,
    );

    const header = whereClause
      ? `Customizing: ${baseTable}  WHERE ${whereClause.trim().replace(/^WHERE /, '')}\n\n`
      : `Customizing: ${baseTable}  (first ${max} rows)\n\n`;

    const text = header + formatQueryResult(rows, max);
    return { isError: false, content: [{ type: 'text' as const, text }] };
  } catch (error: any) {
    logger?.error('CustomizingRead failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}
