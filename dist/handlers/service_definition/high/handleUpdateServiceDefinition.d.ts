/**
 * UpdateServiceDefinition Handler - Update Existing ABAP Service Definition Source
 *
 * Uses AdtClient from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by client.
 *
 * Workflow: lock -> update -> check -> unlock -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateServiceDefinition";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Update source code of an existing ABAP service definition. Uses stateful session with proper lock/unlock mechanism.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly service_definition_name: {
                readonly type: "string";
                readonly description: "Service definition name (e.g., ZSD_MY_SERVICE). Must exist in the system.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Complete service definition source code.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Optional if object is local or already in transport.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate service definition after update. Default: true.";
            };
        };
        readonly required: readonly ["service_definition_name", "source_code"];
    };
};
interface UpdateServiceDefinitionArgs {
    service_definition_name: string;
    source_code: string;
    transport_request?: string;
    activate?: boolean;
}
/**
 * Main handler for UpdateServiceDefinition MCP tool
 *
 * Uses AdtClient for all operations
 * Session and lock management handled internally by client
 */
export declare function handleUpdateServiceDefinition(context: HandlerContext, args: UpdateServiceDefinitionArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateServiceDefinition.d.ts.map