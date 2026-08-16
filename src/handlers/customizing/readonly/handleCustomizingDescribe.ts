/**
 * CustomizingDescribe — describe a customizing object: maintenance view/table
 * set, key fields, auth group, IMG activity and the official transport object.
 *
 * Ported from abap-config-mcp.
 */

import { resolveMaint } from '../../../lib/customizing/resolveMaint';
import { col, runSql, sql1 } from '../../../lib/customizing/runSql';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { ErrorCode, McpError } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CustomizingDescribe',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[customizing] Describe a customizing object (maintenance view or config table): full table set (base + text), key fields, auth group, IMG activity, delivery class and the R3TR transport object (VDAT/TABU/CDAT).',
  inputSchema: {
    type: 'object',
    properties: {
      object_name: {
        type: 'string',
        description:
          'Maintenance view name (TVDIR) or base table name (DD02L), e.g. V_T001 or T001.',
      },
      language: {
        type: 'string',
        description: 'Description language (default E).',
        default: 'E',
      },
    },
    required: ['object_name'],
  },
} as const;

interface DescribeArgs {
  object_name: string;
  language?: string;
}

export async function handleCustomizingDescribe(
  context: HandlerContext,
  args: DescribeArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.object_name) {
      throw new McpError(ErrorCode.InvalidParams, 'object_name is required');
    }
    const lang = (args.language ?? 'E').toUpperCase();
    const obj = args.object_name.toUpperCase().replace(/'/g, "''");

    const maint = await resolveMaint(connection, logger, obj);
    const baseTable = maint.rootTable;

    const dd02lRows = await sql1(
      connection,
      logger,
      `SELECT TABNAME, TABCLASS, CONTFLAG, CLIDEP, MAINFLAG FROM DD02L WHERE TABNAME = '${baseTable}'`,
    );
    const dd02tRows = await sql1(
      connection,
      logger,
      `SELECT TABNAME, DDTEXT FROM DD02T WHERE TABNAME = '${baseTable}' AND DDLANGUAGE = '${lang}' AND AS4LOCAL = 'A'`,
    );
    const dd02 = { ...(dd02lRows[0] ?? {}), ...(dd02tRows[0] ?? {}) };

    const fields = await sql1(
      connection,
      logger,
      `SELECT FIELDNAME, KEYFLAG, ROLLNAME, DATATYPE, LENG, DECIMALS, POSITION ` +
        `FROM DD03L WHERE TABNAME = '${baseTable}' AND AS4LOCAL = 'A' ` +
        `AND FIELDNAME <> '.INCLUDE' ORDER BY POSITION`,
    );

    const tddatRows = await sql1(
      connection,
      logger,
      `SELECT TABNAME, CCLASS FROM TDDAT WHERE TABNAME = '${baseTable}'`,
    );
    const authGroup =
      (tddatRows[0] ? col(tddatRows[0], 'CCLASS') : '') ||
      maint.authGroup ||
      '';

    const clusterName = maint.cluster;

    const keyFields = fields
      .filter((f) => col(f, 'KEYFLAG') === 'X')
      .map((f) => col(f, 'FIELDNAME'));
    let fkRows: Array<Record<string, string>> = [];
    if (keyFields.length > 0) {
      const fkIn = keyFields.map((f) => `'${f}'`).join(',');
      fkRows = await sql1(
        connection,
        logger,
        `SELECT TABNAME, FIELDNAME, CHECKTABLE, CHECKFIELD, FRKEYNAME ` +
          `FROM DD08L WHERE TABNAME = '${baseTable}' AND FIELDNAME IN (${fkIn}) AND AS4LOCAL = 'A'`,
      );
    }

    const lines: string[] = [
      `Customizing object: ${obj}`,
      dd02.DDTEXT ? `Description:        ${col(dd02, 'DDTEXT')}` : '',
      `Base table:         ${baseTable}`,
    ];

    if (maint.isView) {
      lines.push(
        `Maintenance view:   ${maint.view}  (${maint.maintTcode ?? 'SM30'})`,
        `Table set:          ${maint.tables.join(' + ')}${maint.textTable ? `   (text table: ${maint.textTable})` : ''}`,
        `Function group:     ${maint.funcGroup ?? '?'}   Maint. type: ${maint.maintType === '2' ? '2 (two-step)' : (maint.maintType ?? '?')}`,
      );
    }
    if (maint.imgActivity) {
      lines.push(
        `IMG activity:       ${maint.imgActivity}${maint.imgActivityText ? `  —  ${maint.imgActivityText}` : ''}`,
      );
    }
    lines.push(
      `Transport object:   R3TR ${maint.transport.object} ${maint.transport.name}` +
        (maint.transport.object === 'VDAT'
          ? '   (records the whole view: base + text table)'
          : ''),
    );
    if (dd02.CONTFLAG !== undefined) {
      const cfDesc: Record<string, string> = {
        C: 'C — customizing (transport with workbench/cust. request)',
        G: 'G — customizing (client-independent)',
        S: 'S — system (SAP-managed, not transportable)',
        E: 'E — system (client-independent)',
        W: 'W — system (client-independent, industry solution)',
        A: 'A — application data',
        L: 'L — local / temporary',
      };
      lines.push(
        `Delivery class:     ${cfDesc[col(dd02, 'CONTFLAG')] ?? col(dd02, 'CONTFLAG')}`,
      );
      lines.push(
        `Client-dependent:   ${col(dd02, 'CLIDEP') === 'X' ? 'yes (MANDT key field)' : 'no'}`,
      );
    }
    lines.push(
      `Auth group (TDDAT): ${authGroup || '(none — S_TABU_DIS with &NC& or check TVDIR CCLASS)'}`,
    );

    if (clusterName) {
      lines.push(
        `View cluster:       ${clusterName} (SM34 → R3TR CDAT; engine writes the member view → VDAT)`,
      );
    }

    if (fields.length > 0) {
      lines.push('', `Fields (${fields.length}):`);
      lines.push(
        `  ${'Field'.padEnd(30)} ${'Key'} ${'Type'.padEnd(8)} ${'Len'.padEnd(5)}`,
      );
      lines.push(`  ${'-'.repeat(80)}`);
      for (const f of fields) {
        const key = col(f, 'KEYFLAG') === 'X' ? '🔑 ' : '   ';
        lines.push(
          `  ${col(f, 'FIELDNAME').padEnd(30)} ${key} ${col(f, 'DATATYPE').padEnd(8)} ${col(f, 'LENG').padEnd(5)}`,
        );
      }
    }

    if (fkRows.length > 0) {
      lines.push('', 'Foreign keys on key fields (org-unit candidates):');
      for (const fk of fkRows) {
        lines.push(
          `  ${col(fk, 'FIELDNAME').padEnd(20)} → ${col(fk, 'CHECKTABLE')}.${col(fk, 'CHECKFIELD')}`,
        );
      }
    }

    lines.push(
      '',
      'Next steps:',
      `  CustomizingRead   objectName: ${obj}  — read current config rows`,
      `  CustomizingDiff   objectName: ${obj}  sourceKey: <val>  targetKey: <val>  keyField: <field>  — compare two org units`,
    );

    return {
      isError: false,
      content: [
        { type: 'text' as const, text: lines.filter(Boolean).join('\n') },
      ],
    };
  } catch (error: any) {
    logger?.error('CustomizingDescribe failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}
