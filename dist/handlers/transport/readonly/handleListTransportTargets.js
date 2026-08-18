"use strict";
/**
 * ListTransportTargets — discover the transport targets this system uses
 * (distinct E070.TARSYSTEM) and the default CreateTransport would pick.
 * Read-only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleListTransportTargets = handleListTransportTargets;
const createTransport_1 = require("../../../lib/transport/createTransport");
exports.TOOL_DEFINITION = {
    name: 'ListTransportTargets',
    available_in: ['onprem', 'legacy'],
    description: '[transport] List the transport target systems used by this SAP system (distinct E070.TARSYSTEM) and the default target CreateTransport auto-selects. Read-only.',
    inputSchema: { type: 'object', properties: {} },
};
async function handleListTransportTargets(context) {
    const { connection, logger } = context;
    try {
        const { targets, defaultTarget } = await (0, createTransport_1.discoverTransportTargets)(connection, logger);
        const lines = [
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
            content: [{ type: 'text', text: lines.join('\n') }],
        };
    }
    catch (error) {
        logger?.error('ListTransportTargets failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
//# sourceMappingURL=handleListTransportTargets.js.map