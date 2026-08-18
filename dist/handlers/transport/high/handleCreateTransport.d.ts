/**
 * CreateTransport Handler - Create a new ABAP transport request.
 *
 * Uses the corrected in-repo transport helper (`lib/transport/createTransport`)
 * which builds the CTS XML with a RAW target name — the client lib wraps the
 * target in `/…/` and the CTS endpoint rejects/misinterprets that.
 * When `target_system` is omitted, the system's transport target is
 * auto-discovered from E070 (e.g. VSD) instead of falling back to LOCAL.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateTransport";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP transport request (Workbench K or Customizing T). Target system is auto-discovered from the system (e.g. VSD) when omitted; pass target_system explicitly to override. Use ListTransportTargets to see available targets.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly transport_type: {
                readonly type: "string";
                readonly description: "Transport type: 'workbench' (cross-client) or 'customizing' (client-specific)";
                readonly enum: readonly ["workbench", "customizing"];
                readonly default: "workbench";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Transport request description (mandatory)";
            };
            readonly target_system: {
                readonly type: "string";
                readonly description: "Target system for transport (optional). Auto-discovered from E070 when omitted (e.g. 'VSD'). Pass the raw system ID, no slashes.";
            };
            readonly owner: {
                readonly type: "string";
                readonly description: "Transport owner (optional, defaults to current user)";
            };
        };
        readonly required: readonly ["description"];
    };
};
interface CreateTransportArgs {
    transport_type?: string;
    description: string;
    target_system?: string;
    owner?: string;
}
/**
 * Main handler for CreateTransport MCP tool
 */
export declare function handleCreateTransport(context: HandlerContext, args: CreateTransportArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleCreateTransport.d.ts.map