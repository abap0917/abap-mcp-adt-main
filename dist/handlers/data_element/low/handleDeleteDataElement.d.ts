/**
 * DeleteDataElement Handler - Delete ABAP DataElement
 *
 * Uses AdtClient.deleteDataElement from @babamba2/mcp-abap-adt-clients.
 * Low-level handler: single method call.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteDataElementLow";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[low-level] Delete an ABAP data element from the SAP system via ADT deletion API. Transport request optional for $TMP objects.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly data_element_name: {
                readonly type: "string";
                readonly description: "DataElement name (e.g., Z_MY_PROGRAM).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable objects. Optional for local objects ($TMP).";
            };
        };
        readonly required: readonly ["data_element_name"];
    };
};
interface DeleteDataElementArgs {
    data_element_name: string;
    transport_request?: string;
}
/**
 * Main handler for DeleteDataElement MCP tool
 *
 * Uses AdtClient.deleteDataElement - low-level single method call
 */
export declare function handleDeleteDataElement(context: HandlerContext, args: DeleteDataElementArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleDeleteDataElement.d.ts.map