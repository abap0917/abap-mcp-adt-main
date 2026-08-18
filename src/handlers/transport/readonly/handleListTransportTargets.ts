/**
 * ListTransportTargets — discover the transport targets this system uses
 * (distinct E070.TARSYSTEM) and the default CreateTransport would pick.
 * Read-only.
 */

import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { discoverTransportTargets } from '../../../lib/transport/createTransport';

export const TOOL_DEFINITION = {
  name: 'ListTransportTargets',
  available_in: ['onprem', 'legacy'] as const,
  description:
    '[transport] List the transport target systems used by this SAP system (distinct E070.TARSYSTEM) and the default target CreateTransport auto-selects. Read-only.',
  inputSchema: { type: 'object', properties: {} },
} as const;

export async function handleListTransportTargets(context: HandlerContext) {
  const { connection, logger } = context;
  try {
    const { targets, defaultTarget } = await discoverTransportTargets(
      connection,
      logger,
    );
    const lines: string[] = [
      `Transport targets (${targets.length}):`,
      targets.length
        ? targets.map((t) => `  ${t}`).join('\n')
        : '  (none found)',
      '',
      `Default target for CreateTransport: ${defaultTarget ?? '(none → LOCAL)'}`,
      '',
      'Pass target_system to CreateTransport to override, e.g. target_system: "VSD".',
    ];
    return {
      isError: false,
      content: [{ type: 'text' as const, text: lines.join('\n') }],
    };
  } catch (error: any) {
    logger?.error('ListTransportTargets failed', error);
    return {
      isError: true,
      content: [
        { type: 'text' as const, text: String(error?.message ?? error) },
      ],
    };
  }
}
