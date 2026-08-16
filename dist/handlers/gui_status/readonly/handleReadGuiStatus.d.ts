/**
 * ReadGuiStatus Handler - Read ABAP GUI Status definition
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RS_CUA_INTERNAL_FETCH.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[read-only] Read ABAP GUI Status definition (statuses, function codes, menus, toolbars, titles) for a program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., SAPMV45A).";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
export declare function handleReadGuiStatus(context: HandlerContext, args: {
    program_name: string;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadGuiStatus.d.ts.map