"use strict";
/**
 * CreateTransport Handler - Create a new ABAP transport request.
 *
 * Uses the corrected in-repo transport helper (`lib/transport/createTransport`)
 * which builds the CTS XML with a RAW target name — the client lib wraps the
 * target in `/…/` and the CTS endpoint rejects/misinterprets that.
 * When `target_system` is omitted, the system's transport target is
 * auto-discovered from E070 (e.g. VSD) instead of falling back to LOCAL.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleCreateTransport = handleCreateTransport;
const adtError_1 = require("../../../lib/adtError");
const systemContext_1 = require("../../../lib/systemContext");
const createTransport_1 = require("../../../lib/transport/createTransport");
const utils_1 = require("../../../lib/utils");
exports.TOOL_DEFINITION = {
    name: 'CreateTransport',
    available_in: ['onprem', 'cloud'],
    description: 'Create a new ABAP transport request (Workbench K or Customizing T). Target system is auto-discovered from the system (e.g. VSD) when omitted; pass target_system explicitly to override. Use ListTransportTargets to see available targets.',
    inputSchema: {
        type: 'object',
        properties: {
            transport_type: {
                type: 'string',
                description: "Transport type: 'workbench' (cross-client) or 'customizing' (client-specific)",
                enum: ['workbench', 'customizing'],
                default: 'workbench',
            },
            description: {
                type: 'string',
                description: 'Transport request description (mandatory)',
            },
            target_system: {
                type: 'string',
                description: "Target system for transport (optional). Auto-discovered from E070 when omitted (e.g. 'VSD'). Pass the raw system ID, no slashes.",
            },
            owner: {
                type: 'string',
                description: 'Transport owner (optional, defaults to current user)',
            },
        },
        required: ['description'],
    },
};
/**
 * Main handler for CreateTransport MCP tool
 */
async function handleCreateTransport(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.description) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'Transport description is required');
        }
        const ctx = (0, systemContext_1.getSystemContext)();
        const owner = args.owner?.trim() || ctx.responsible || undefined;
        if (!owner) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'owner is required — provide the SAP username or set SAP_USERNAME in the connection profile');
        }
        // Target: explicit → normalize (strip slashes) ; omitted → auto-discover.
        let targetSystem = args.target_system?.trim()?.replace(/^\/+|\/+$/g, '');
        let discoveredTarget = null;
        if (!targetSystem) {
            const discovered = await (0, createTransport_1.discoverTransportTargets)(connection, logger);
            discoveredTarget = discovered.defaultTarget;
            targetSystem = discoveredTarget ?? 'LOCAL';
        }
        logger?.info(`Creating transport "${args.description}" (${args.transport_type === 'customizing' ? 'customizing/T' : 'workbench/K'}) target=${targetSystem}${discoveredTarget ? ' (auto-discovered)' : ''} owner=${owner}`);
        const transport = await (0, createTransport_1.createTransportRequest)(connection, logger, {
            description: args.description,
            transportType: args.transport_type === 'customizing' ? 'customizing' : 'workbench',
            targetSystem,
            owner,
        }, owner);
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
                { type: 'text', text: JSON.stringify(result, null, 2) },
            ],
        };
    }
    catch (error) {
        logger?.error('CreateTransport failed:', error);
        if (error instanceof utils_1.McpError)
            throw error;
        return {
            isError: true,
            content: [
                {
                    type: 'text',
                    text: `Failed to create transport: ${(0, adtError_1.toErrorMessage)(error)}`,
                },
            ],
        };
    }
}
//# sourceMappingURL=handleCreateTransport.js.map