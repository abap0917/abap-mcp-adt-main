/**
 * DeleteStructure Handler - Delete ABAP Structure
 *
 * Uses AdtClient.deleteStructure from @babamba2/mcp-abap-adt-clients.
 * Low-level handler: single method call.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteStructureLow";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[low-level] Delete an ABAP structure from the SAP system via ADT deletion API. Transport request optional for $TMP objects.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly structure_name: {
                readonly type: "string";
                readonly description: "Structure name (e.g., Z_MY_PROGRAM).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable objects. Optional for local objects ($TMP).";
            };
        };
        readonly required: readonly ["structure_name"];
    };
};
interface DeleteStructureArgs {
    structure_name: string;
    transport_request?: string;
}
/**
 * Main handler for DeleteStructure MCP tool
 *
 * Uses AdtClient.deleteStructure - low-level single method call
 */
export declare function handleDeleteStructure(context: HandlerContext, args: DeleteStructureArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleDeleteStructure.d.ts.map