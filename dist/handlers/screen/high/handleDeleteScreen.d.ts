/**
 * DeleteScreen Handler (High-level) - Delete an ABAP Screen via RFC
 *
 * Locks program, deletes screen via RFC, unlocks.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteScreen";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Delete an ABAP Screen (Dynpro) from a program. Handles lock/unlock automatically.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number to delete.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
        };
        readonly required: readonly ["program_name", "screen_number"];
    };
};
export declare function handleDeleteScreen(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleDeleteScreen.d.ts.map