/**
 * UpdateInterface Handler - Update existing ABAP Interface source code
 *
 * Uses InterfaceBuilder from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive version) -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateInterface";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "Update source code of an existing ABAP interface. Uses stateful session with proper lock/unlock mechanism. Lock handle and transport number are passed in URL parameters.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly interface_name: {
                readonly type: "string";
                readonly description: "Interface name (e.g., ZIF_MY_INTERFACE). Must exist in the system.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Complete ABAP interface source code with INTERFACE...ENDINTERFACE section.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Optional if object is local or already in transport.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate interface after update. Default: true.";
            };
        };
        readonly required: readonly ["interface_name", "source_code"];
    };
};
interface UpdateInterfaceArgs {
    interface_name: string;
    source_code: string;
    transport_request?: string;
    activate?: boolean;
}
/**
 * Main handler for UpdateInterface MCP tool
 *
 * Uses InterfaceBuilder from @babamba2/mcp-abap-adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export declare function handleUpdateInterface(context: HandlerContext, args: UpdateInterfaceArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateInterface.d.ts.map