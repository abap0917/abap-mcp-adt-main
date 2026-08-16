/**
 * DeleteGuiStatus Handler (High-level) - Delete an ABAP GUI Status
 *
 * Locks program, deletes via RFC, unlocks.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Delete an ABAP GUI Status from a program. Handles lock/unlock automatically.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "GUI Status name to delete.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
        };
        readonly required: readonly ["program_name", "status_name"];
    };
};
export declare function handleDeleteGuiStatus(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleDeleteGuiStatus.d.ts.map