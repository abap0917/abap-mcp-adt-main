/**
 * Customizing write tools:
 *   CustomizingApply  — copy or delete config the SM30-standard way through the
 *     engine (VIEW_MAINTENANCE_SINGLE_ENTRY) with governed transport recording.
 *   CustomizingCreate — write explicit rows through the engine.
 *   CustomizingStatus — poll an async engine commit by run_id.
 *
 * Ported from abap-config-mcp. DRY RUN by default — commit: true applies.
 */

import {
  callEngine,
  type EngineResponse,
} from '../../../lib/customizing/engineClient';
import { ensureEngine } from '../../../lib/customizing/ensureEngine';
import { resolveMaint } from '../../../lib/customizing/resolveMaint';
import { resolveTransport } from '../../../lib/customizing/transportGovernance';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { ErrorCode, McpError } from '../../../lib/utils';

const applyTool = {
  name: 'CustomizingApply',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[customizing] Copy (or delete) customizing rows from sourceKey to targetKey through the SM30 maintenance-view runtime (foreign-key checks, change documents, governed transport recording — exactly like a manual SPRO change). DRY RUN by default; commit: true applies.',
  inputSchema: {
    type: 'object',
    properties: {
      object_name: {
        type: 'string',
        description: 'Maintenance view or base table, e.g. V_T001 / T001.',
      },
      key_field: {
        type: 'string',
        description: 'Org-unit key field, e.g. BUKRS.',
      },
      source_key: { type: 'string', description: 'Source org-unit value.' },
      target_key: {
        type: 'string',
        description:
          'Target org-unit value (for action delete: the key to delete).',
      },
      action: {
        type: 'string',
        enum: ['copy', 'delete'],
        description: 'copy (default) or delete.',
        default: 'copy',
      },
      commit: {
        type: 'boolean',
        description: 'Apply the change (false = dry run, default).',
        default: false,
      },
      only_missing: {
        type: 'boolean',
        description:
          'copy: skip keys already present in target (default true).',
        default: true,
      },
      values: {
        type: 'array',
        description:
          'Optional [{field, value}] overrides applied to every copied row.',
        items: {
          type: 'object',
          properties: { field: { type: 'string' }, value: { type: 'string' } },
          required: ['field', 'value'],
        },
      },
      transport: {
        type: 'string',
        description:
          'Customizing transport request or task (W function). If omitted and create_transport is false, an interactive prompt is returned instead of writing.',
      },
      create_transport: {
        type: 'boolean',
        description: 'Let the engine create a new Customizing request.',
        default: false,
      },
      show_all_transports: {
        type: 'boolean',
        description: "Include every user's open requests in the prompt.",
        default: false,
      },
      no_transport: {
        type: 'boolean',
        description:
          'Write WITHOUT a transport request (skips transport governance; the engine routes by client capability — on a non-recording client like this one, changes go through the SM30 view runtime without transport recording). Use only for dev/test or when SCC4 does not record customizing changes.',
        default: false,
      },
      auto_deploy: {
        type: 'boolean',
        description:
          'Redeploy the engine if missing or stale before writing (default true).',
        default: true,
      },
      package_name: {
        type: 'string',
        description:
          'ABAP package used only when auto_deploy redeploys (default $TMP).',
        default: '$TMP',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request used only when auto_deploy redeploys (for transportable packages).',
      },
    },
    required: ['object_name', 'key_field', 'source_key', 'target_key'],
  },
} as const;

const createTool = {
  name: 'CustomizingCreate',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[customizing] Write explicit customizing rows through the engine (SM30 view runtime). DRY RUN by default; commit: true applies. Rows are [{field, value}, …] per row.',
  inputSchema: {
    type: 'object',
    properties: {
      object_name: {
        type: 'string',
        description: 'Maintenance view or base table.',
      },
      rows: {
        type: 'array',
        description:
          'Explicit rows; each row is an array of {field, value} (full key + data).',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string' },
              value: { type: 'string' },
            },
            required: ['field', 'value'],
          },
        },
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
        description: 'Engine creates a new Customizing request.',
        default: false,
      },
      auto_deploy: {
        type: 'boolean',
        description:
          'Redeploy the engine if missing or stale before writing (default true).',
        default: true,
      },
      package_name: {
        type: 'string',
        description:
          'ABAP package used only when auto_deploy redeploys (default $TMP).',
        default: '$TMP',
      },
      transport_request: {
        type: 'string',
        description:
          'Transport request used only when auto_deploy redeploys (for transportable packages).',
      },
    },
    required: ['object_name', 'rows'],
  },
} as const;

const statusTool = {
  name: 'CustomizingStatus',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[customizing] Poll the result of an async customizing commit/delete by its run_id (returned by CustomizingApply / CustomizingCreate / OrgCopy when a commit is still pending).',
  inputSchema: {
    type: 'object',
    properties: {
      run_id: {
        type: 'string',
        description: '22-char run id returned by a pending write.',
      },
    },
    required: ['run_id'],
  },
} as const;

interface ApplyArgs {
  object_name: string;
  key_field: string;
  source_key: string;
  target_key: string;
  action?: 'copy' | 'delete';
  commit?: boolean;
  only_missing?: boolean;
  values?: Array<{ field: string; value: string }>;
  transport?: string;
  create_transport?: boolean;
  show_all_transports?: boolean;
  no_transport?: boolean;
  auto_deploy?: boolean;
  package_name?: string;
  transport_request?: string;
}

interface CreateArgs {
  object_name: string;
  rows: Array<Array<{ field: string; value: string }>>;
  commit?: boolean;
  transport?: string;
  create_transport?: boolean;
  auto_deploy?: boolean;
  package_name?: string;
  transport_request?: string;
}

function formatEngineResult(res: EngineResponse, verb: string): string {
  const lines: string[] = [
    `${res.STATUS === 'ok' ? '✅' : res.STATUS === 'pending' ? '⏳' : '❌'} ${verb} (engine ${res.VERSION ?? '?'})`,
  ];
  if (res.DRY_RUN === 'X')
    lines.push('  Dry run — nothing written (re-run with commit: true)');
  if (res.ROWS_PLANNED !== undefined)
    lines.push(`  Rows planned: ${res.ROWS_PLANNED}`);
  if (res.ROWS_WRITTEN !== undefined)
    lines.push(`  Rows written: ${res.ROWS_WRITTEN}`);
  if (res.TRANSPORT) lines.push(`  Transport: ${res.TRANSPORT}`);
  if (res.RUN_ID) {
    lines.push(`  Run id: ${res.RUN_ID}`);
    lines.push('  Commit still running — poll with CustomizingStatus (run_id)');
  }
  for (const m of res.MESSAGES ?? []) lines.push(`  • ${m}`);
  return lines.join('\n');
}

export async function handleCustomizingApply(
  context: HandlerContext,
  args: ApplyArgs,
) {
  const { connection, logger } = context;
  try {
    const required = [
      'object_name',
      'key_field',
      'source_key',
      'target_key',
    ] as const;
    for (const k of required) {
      if (!args?.[k])
        throw new McpError(ErrorCode.InvalidParams, `${k} is required`);
    }
    const action = args.action ?? 'copy';
    const commit = args.commit === true;
    const onlyMissing = args.only_missing !== false;

    // autoDeploy gate (aligned with upstream): redeploy if stale, unless disabled.
    let deployNote = '';
    try {
      deployNote = await ensureEngine(context, {
        autoDeploy: args.auto_deploy !== false,
        package_name: args.package_name,
        transport_request: args.transport_request,
      });
    } catch (e: any) {
      if (args.auto_deploy === false) throw e;
      return {
        isError: true,
        content: [{ type: 'text' as const, text: String(e?.message ?? e) }],
      };
    }

    const maint = await resolveMaint(connection, logger, args.object_name);
    if (!maint.maintObject) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `${maint.rootTable} has no SM30/SM34 maintenance object (no view, not self-maintained) — only a direct untransported write would be possible; this port refuses it. Use CustomizingCreate with record_transport:false semantics only if you know what you are doing.`,
          },
        ],
      };
    }

    let decision: {
      kind: 'transport' | 'create' | 'direct';
      transport?: string;
    };
    if (args.no_transport) {
      // Explicit no-transport write: skip governance; the engine routes by
      // client capability (non-recording client → SM30 view runtime, no
      // transport recording; transport must be omitted in that mode).
      decision = { kind: 'direct' };
    } else {
      const d = await resolveTransport(
        connection,
        logger,
        {
          transport: args.transport,
          createTransport: args.create_transport,
          showAllTransports: args.show_all_transports,
        },
        `MCP cust ${maint.rootTable} ${args.source_key}->${args.target_key}`,
      );
      if (d.kind === 'prompt') {
        return {
          isError: false,
          content: [
            {
              type: 'text' as const,
              text: deployNote ? `${d.prompt}\n\n${deployNote}` : d.prompt,
            },
          ],
        };
      }
      decision = { kind: d.kind, transport: d.transport };
    }

    const valuesJson =
      args.values && args.values.length
        ? JSON.stringify(
            args.values.map((v) => ({
              FIELD: v.field.toUpperCase(),
              VALUE: v.value,
            })),
          )
        : undefined;

    const req: Record<string, unknown> = {
      table: maint.rootTable,
      key_field: args.key_field.toUpperCase(),
      source_key: args.source_key,
      target_key: args.target_key,
      view_name: maint.view ?? '',
      transport_object: maint.recordObject,
      only_missing: onlyMissing ? 'X' : '',
      commit: commit ? 'X' : '',
    };
    if (decision.transport) req.transport = decision.transport;
    if (decision.kind === 'create') req.create_transport = 'X';
    if (valuesJson) req.values_json = valuesJson;

    const op = action === 'delete' ? 'delete' : 'write';
    const res = await callEngine(connection, logger, op, req);
    const text = formatEngineResult(
      res,
      action === 'delete' ? 'Customizing delete' : 'Customizing copy',
    );
    return {
      isError: res.STATUS === 'error',
      content: [
        {
          type: 'text' as const,
          text: deployNote ? `${text}\n\n${deployNote}` : text,
        },
      ],
    };
  } catch (error: any) {
    logger?.error('CustomizingApply failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}

export async function handleCustomizingCreate(
  context: HandlerContext,
  args: CreateArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.object_name || !Array.isArray(args.rows)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'object_name and rows are required',
      );
    }
    const commit = args.commit === true;

    // autoDeploy gate (aligned with upstream).
    let deployNote = '';
    try {
      deployNote = await ensureEngine(context, {
        autoDeploy: args.auto_deploy !== false,
        package_name: args.package_name,
        transport_request: args.transport_request,
      });
    } catch (e: any) {
      if (args.auto_deploy === false) throw e;
      return {
        isError: true,
        content: [{ type: 'text' as const, text: String(e?.message ?? e) }],
      };
    }

    const maint = await resolveMaint(connection, logger, args.object_name);
    if (!maint.maintObject) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `${maint.rootTable} has no SM30/SM34 maintenance object — the engine cannot write it through the standard runtime.`,
          },
        ],
      };
    }
    const decision = await resolveTransport(
      connection,
      logger,
      { transport: args.transport, createTransport: args.create_transport },
      `MCP cust ${maint.rootTable} create`,
    );
    if (decision.kind === 'prompt') {
      return {
        isError: false,
        content: [
          {
            type: 'text' as const,
            text: deployNote
              ? `${decision.prompt}\n\n${deployNote}`
              : decision.prompt,
          },
        ],
      };
    }

    const rowsJson = JSON.stringify(
      args.rows.map((row) =>
        row.map((c) => ({ FIELD: c.field.toUpperCase(), VALUE: c.value })),
      ),
    );
    const req: Record<string, unknown> = {
      table: maint.rootTable,
      view_name: maint.view ?? '',
      transport_object: maint.recordObject,
      rows_json: rowsJson,
      commit: commit ? 'X' : '',
    };
    if (decision.transport) req.transport = decision.transport;
    if (decision.kind === 'create') req.create_transport = 'X';

    const res = await callEngine(connection, logger, 'create', req);
    const text = formatEngineResult(res, 'Customizing create');
    return {
      isError: res.STATUS === 'error',
      content: [
        {
          type: 'text' as const,
          text: deployNote ? `${text}\n\n${deployNote}` : text,
        },
      ],
    };
  } catch (error: any) {
    logger?.error('CustomizingCreate failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}

export async function handleCustomizingStatus(
  context: HandlerContext,
  args: { run_id: string },
) {
  const { connection, logger } = context;
  try {
    if (!args?.run_id)
      throw new McpError(ErrorCode.InvalidParams, 'run_id is required');
    const res = await callEngine(
      connection,
      logger,
      'status',
      { run_id: args.run_id },
      30_000,
    );
    if (res.STATUS === 'pending') {
      return {
        isError: false,
        content: [
          {
            type: 'text' as const,
            text: `⏳ Commit ${args.run_id} still running — poll again in a few seconds.`,
          },
        ],
      };
    }
    return {
      isError: res.STATUS === 'error',
      content: [
        {
          type: 'text' as const,
          text: formatEngineResult(res, 'Customizing status'),
        },
      ],
    };
  } catch (error: any) {
    logger?.error('CustomizingStatus failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}

export const TOOL_DEFINITIONS = [applyTool, createTool, statusTool];
