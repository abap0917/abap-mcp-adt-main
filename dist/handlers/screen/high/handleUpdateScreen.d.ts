/**
 * UpdateScreen Handler (High-level) - Update ABAP Screen via RFC
 *
 * Locks program, deletes+re-inserts screen via RFC, unlocks, optionally activates.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateScreen";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Update an ABAP Screen (Dynpro) definition. Provide full screen data as JSON. Handles lock/unlock automatically.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number (e.g., 0100).";
            };
            readonly dynpro_data: {
                readonly type: "string";
                readonly description: "Complete screen definition as JSON (from GetScreen/ReadScreen).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: false.";
            };
        };
        readonly required: readonly ["program_name", "screen_number", "dynpro_data"];
    };
};
export declare function handleUpdateScreen(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateScreen.d.ts.map