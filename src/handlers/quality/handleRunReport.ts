/**
 * RunReport — run an ABAP report and return its LIST output.
 *
 * The in-system customizing engine executes the report with
 * `SUBMIT … EXPORTING LIST TO MEMORY` + `LIST_FROM_MEMORY` (op `run_report`)
 * and returns the captured list lines. Selection-screen values are passed as
 * RSPARAMS entries.
 *
 * ⚠️ This EXECUTES ABAP code with the connection user's authorizations — use
 * with care; gated to DEV tier by readonlyGuard.
 */

import { callEngine } from '../../lib/customizing/engineClient.js';
import { ensureEngine } from '../../lib/customizing/ensureEngine.js';
import type { HandlerContext } from '../../lib/handlers/interfaces.js';
import { ErrorCode, McpError } from '../../lib/utils.js';

export const TOOL_DEFINITION = {
  name: 'RunReport',
  available_in: ['onprem', 'legacy'] as const,
  description:
    "[runtime] Run an ABAP report and return its LIST output (SUBMIT … EXPORTING LIST TO MEMORY + LIST_FROM_MEMORY via the in-system engine). Selection-screen values can be passed as RSPARAMS entries (selname/kind/sign/option/low/high). Executes with the connection user's authorizations; long reports may take a while.",
  inputSchema: {
    type: 'object',
    properties: {
      program: {
        type: 'string',
        description: 'ABAP report name, e.g. Z_MY_REPORT.',
      },
      params: {
        type: 'array',
        description:
          'Optional selection-screen values (RSPARAMS): [{selname, kind, sign, option, low, high}]. kind: P (parameter) or S (select-option); sign: I (include) / E (exclude); option: EQ/NE/CP/BT etc.; low/high: values.',
        items: {
          type: 'object',
          properties: {
            selname: {
              type: 'string',
              description: 'Selection-screen parameter name, e.g. P_BUKRS.',
            },
            kind: {
              type: 'string',
              enum: ['P', 'S'],
              description: 'P = parameter, S = select-option.',
            },
            sign: {
              type: 'string',
              enum: ['I', 'E'],
              description: 'I = include, E = exclude.',
            },
            option: {
              type: 'string',
              description: 'Comparison option: EQ, NE, CP, BT, …',
            },
            low: { type: 'string', description: 'Lower value.' },
            high: {
              type: 'string',
              description: 'Upper value (for BT/option ranges).',
            },
          },
          required: ['selname'],
        },
      },
      auto_deploy: {
        type: 'boolean',
        description:
          'Redeploy the engine if stale before running (default true).',
        default: true,
      },
    },
    required: ['program'],
  },
} as const;

interface RsparEntry {
  selname: string;
  kind?: 'P' | 'S';
  sign?: 'I' | 'E';
  option?: string;
  low?: string;
  high?: string;
}

interface RunReportArgs {
  program: string;
  params?: RsparEntry[];
  auto_deploy?: boolean;
}

export async function handleRunReport(
  context: HandlerContext,
  args: RunReportArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.program?.trim()) {
      throw new McpError(ErrorCode.InvalidParams, 'program is required');
    }

    // autoDeploy gate: ensures the engine (with the run_report op) is deployed.
    let deployNote = '';
    try {
      deployNote = await ensureEngine(context, {
        autoDeploy: args.auto_deploy !== false,
      });
    } catch (e: any) {
      if (args.auto_deploy === false) throw e;
      return {
        isError: true,
        content: [{ type: 'text' as const, text: String(e?.message ?? e) }],
      };
    }

    const rsparJson =
      args.params && args.params.length
        ? JSON.stringify(
            args.params.map((p) => ({
              SELNAME: p.selname.toUpperCase(),
              KIND: p.kind ?? 'P',
              SIGN: p.sign ?? 'I',
              OPTION: p.option ?? 'EQ',
              LOW: p.low ?? '',
              HIGH: p.high ?? '',
            })),
          )
        : undefined;

    const res = await callEngine(connection, logger, 'run_report', {
      program: args.program.trim().toUpperCase(),
      rspar_json: rsparJson,
    });

    if (res.STATUS === 'error') {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `RunReport failed: ${(res.MESSAGES ?? []).join('; ') || 'unknown'}`,
          },
        ],
      };
    }

    let lines: string[] = [];
    try {
      lines = res.DATA_JSON ? JSON.parse(res.DATA_JSON) : [];
    } catch {
      lines = [];
    }
    const text =
      `Report ${args.program.trim().toUpperCase()} output (${lines.length} line(s))\n\n` +
      (lines.length ? lines.join('\n') : '(no list output)') +
      (deployNote ? `\n\n${deployNote}` : '');
    return { isError: false, content: [{ type: 'text' as const, text }] };
  } catch (error: any) {
    logger?.error('RunReport failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}
