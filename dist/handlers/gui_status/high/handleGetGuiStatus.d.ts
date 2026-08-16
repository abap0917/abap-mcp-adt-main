/**
 * GetGuiStatus Handler - Get ABAP GUI Status definition
 *
 * High-level handler: retrieves GUI status definition with structured data.
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RS_CUA_INTERNAL_FETCH.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Get ABAP GUI Status definition including statuses, function codes, menus, toolbars, and titles.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., SAPMV45A).";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "Optional: filter to a specific GUI Status name. If omitted, returns all statuses.";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
export declare function handleGetGuiStatus(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetGuiStatus.d.ts.map