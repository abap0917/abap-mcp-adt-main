/**
 * CreateGuiStatus Handler (High-level) - Create a new ABAP GUI Status
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP. Fetches existing CUA data,
 * adds the new status entry, writes back, and optionally activates.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Create a new ABAP GUI Status on an existing program. Optionally activates after creation.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., Z_MY_PROGRAM).";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "GUI Status name to create (e.g., MAIN_STATUS).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "GUI Status description.";
            };
            readonly status_type: {
                readonly type: "string";
                readonly description: "Status type: \"N\" (normal/dialog), \"P\" (popup), \"C\" (context menu). Default: \"N\".";
                readonly enum: readonly ["N", "P", "C"];
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after creation. Default: false.";
            };
        };
        readonly required: readonly ["program_name", "status_name"];
    };
};
export declare function handleCreateGuiStatus(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateGuiStatus.d.ts.map