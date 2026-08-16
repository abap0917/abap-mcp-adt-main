/**
 * GetView Handler - Read ABAP View via AdtClient
 *
 * Uses AdtClient.getView().read() for high-level read operation.
 * Supports both active and inactive versions.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetView";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "Retrieve ABAP view definition. Supports reading active or inactive version.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly view_name: {
                readonly type: "string";
                readonly description: "View name (e.g., Z_MY_VIEW).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) for deployed version, \"inactive\" for modified but not activated version.";
                readonly default: "active";
            };
        };
        readonly required: readonly ["view_name"];
    };
};
interface GetViewArgs {
    view_name: string;
    version?: 'active' | 'inactive';
}
/**
 * Main handler for GetView MCP tool
 *
 * Uses AdtClient.getView().read() - high-level read operation
 */
export declare function handleGetView(context: HandlerContext, args: GetViewArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleGetView.d.ts.map