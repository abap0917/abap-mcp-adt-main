/**
 * CreateTransport Handler - Create a new ABAP transport request.
 *
 * Uses the corrected in-repo transport helper (`lib/transport/createTransport`)
 * which builds the CTS XML with a RAW target name — the client lib wraps the
 * target in `/…/` and the CTS endpoint rejects/misinterprets that.
 * When `target_system` is omitted, the system's transport target is
 * auto-discovered from E070 (e.g. VSD) instead of falling back to LOCAL.
 */

import { toErrorMessage } from '../../../lib/adtError';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { getSystemContext } from '../../../lib/systemContext';
import {
  createTransportRequest,
  discoverTransportTargets,
} from '../../../lib/transport/createTransport';
import { ErrorCode, McpError } from '../../../lib/utils';

export const TOOL_DEFINITION = {
  name: 'CreateTransport',
  available_in: ['onprem', 'cloud'] as const,
  description:
    'Create a new ABAP transport request (Workbench K or Customizing T). Target system is auto-discovered from the system (e.g. VSD) when omitted; pass target_system explicitly to override. Use ListTransportTargets to see available targets.',
  inputSchema: {
    type: 'object',
    properties: {
      transport_type: {
        type: 'string',
        description:
          "Transport type: 'workbench' (cross-client) or 'customizing' (client-specific)",
        enum: ['workbench', 'customizing'],
        default: 'workbench',
      },
      description: {
        type: 'string',
        description: 'Transport request description (mandatory)',
      },
      target_system: {
        type: 'string',
        description:
          "Target system for transport (optional). Auto-discovered from E070 when omitted (e.g. 'VSD'). Pass the raw system ID, no slashes.",
      },
      owner: {
        type: 'string',
        description: 'Transport owner (optional, defaults to current user)',
      },
    },
    required: ['description'],
  },
} as const;

interface CreateTransportArgs {
  transport_type?: string;
  description: string;
  target_system?: string;
  owner?: string;
}

/**
 * Main handler for CreateTransport MCP tool
 */
export async function handleCreateTransport(
  context: HandlerContext,
  args: CreateTransportArgs,
) {
  const { connection, logger } = context;
  try {
    if (!args?.description) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Transport description is required',
      );
    }

    const ctx = getSystemContext();
    const owner = args.owner?.trim() || ctx.responsible || undefined;
    if (!owner) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'owner is required — provide the SAP username or set SAP_USERNAME in the connection profile',
      );
    }

    // Target: explicit → normalize (strip slashes) ; omitted → auto-discover.
    let targetSystem = args.target_system?.trim()?.replace(/^\/+|\/+$/g, '');
    let discoveredTarget: string | null = null;
    if (!targetSystem) {
      const discovered = await discoverTransportTargets(connection, logger);
      discoveredTarget = discovered.defaultTarget;
      targetSystem = discoveredTarget ?? 'LOCAL';
    }

    logger?.info(
      `Creating transport "${args.description}" (${args.transport_type === 'customizing' ? 'customizing/T' : 'workbench/K'}) target=${targetSystem}${discoveredTarget ? ' (auto-discovered)' : ''} owner=${owner}`,
    );

    const transport = await createTransportRequest(
      connection,
      logger,
      {
        description: args.description,
        transportType:
          args.transport_type === 'customizing' ? 'customizing' : 'workbench',
        targetSystem,
        owner,
      },
      owner,
    );

    logger?.info(`✅ CreateTransport completed: ${transport.transport_number}`);
    const result = {
      success: true,
      transport_request: transport.transport_number,
      description: transport.description,
      type: transport.type,
      target_system: transport.target_system,
      target_desc: transport.target_desc,
      cts_project: transport.cts_project,
      owner: transport.owner,
      uri: transport.uri,
      target_auto_discovered: discoveredTarget !== null,
      message: `Transport request ${transport.transport_number} created successfully`,
    };
    return {
      isError: false,
      content: [
        { type: 'text' as const, text: JSON.stringify(result, null, 2) },
      ],
    };
  } catch (error: any) {
    logger?.error('CreateTransport failed:', error);
    if (error instanceof McpError) throw error;
    return {
      isError: true,
      content: [
        {
          type: 'text' as const,
          text: `Failed to create transport: ${toErrorMessage(error)}`,
        },
      ],
    };
  }
}
