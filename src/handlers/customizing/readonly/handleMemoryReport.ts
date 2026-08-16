/**
 * HanaMemoryReport / AbapMemoryReport — system memory diagnostics via the
 * Tier-0 diagnostic engine (ZCL_MCP_DIAG at /sap/bc/zmcp_diag).
 *
 * Ported from abap-config-mcp. Requires the DIAG engine deployed + SICF node
 * registered; read-only and safe for production.
 */

import { DIAG_ICF_PATH } from '../../../abap/engineMeta';
import { callDiag } from '../../../lib/customizing/engineClient';
import type { HandlerContext } from '../../../lib/handlers/interfaces';

const hanaTool = {
  name: 'HanaMemoryReport',
  available_in: ['onprem'] as const,
  description:
    '[runtime] HANA memory report (host / service / heap / column-store / SQL plan cache) via the deployed diagnostic engine. Read-only.',
  inputSchema: { type: 'object', properties: {} },
} as const;

const abapTool = {
  name: 'AbapMemoryReport',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[runtime] ABAP work process memory report (profile parameters + live usage) via the deployed diagnostic engine. Read-only.',
  inputSchema: { type: 'object', properties: {} },
} as const;

async function runReport(
  context: HandlerContext,
  operation: 'hana_memory' | 'abap_memory',
  engineName: string,
  minVersion: string,
) {
  const { connection, logger } = context;
  try {
    const res = await callDiag(connection, logger, operation);
    if (res.STATUS === 'error') {
      const msg = (res.MESSAGES ?? []).join('; ') || 'engine error';
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `Engine error: ${msg}\nDeploy the DIAG engine (engine version ≥ ${minVersion}) and register SICF node ${DIAG_ICF_PATH}.`,
          },
        ],
      };
    }
    let data: string[] = [];
    try {
      data = res.DATA_JSON ? JSON.parse(res.DATA_JSON) : [];
    } catch {
      data = [];
    }
    const text =
      `${engineName} (engine ${res.VERSION ?? '?'})\n\n` +
      (data.length ? data.join('\n') : '(no data)');
    return { isError: false, content: [{ type: 'text' as const, text }] };
  } catch (error: any) {
    logger?.error(`${engineName} failed`, error);
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text:
            `${String(error?.message ?? error)}\n\n` +
            `The diagnostic engine is not reachable at ${DIAG_ICF_PATH}. ` +
            `Deploy it with CustomizingEngineBootstrap (deploy_diag: true) and register the SICF node, then retry.`,
        },
      ],
    };
  }
}

export async function handleHanaMemoryReport(context: HandlerContext) {
  return runReport(context, 'hana_memory', 'HANA Memory Report', '0.9.8');
}

export async function handleAbapMemoryReport(context: HandlerContext) {
  return runReport(context, 'abap_memory', 'ABAP Memory Report', '0.9.16');
}

export const TOOL_DEFINITIONS = [hanaTool, abapTool];
