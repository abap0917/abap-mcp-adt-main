/**
 * CreateScreen Handler (High-level) - Create a new ABAP Screen via RFC
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RPY_DYNPRO_INSERT.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateScreen";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Create a new ABAP Screen (Dynpro) on an existing program. Optionally activates.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number to create (e.g., 0100).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Screen description.";
            };
            readonly dynpro_data: {
                readonly type: "string";
                readonly description: "Full screen definition as JSON. If omitted, creates minimal screen.";
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
        readonly required: readonly ["program_name", "screen_number"];
    };
};
export declare function handleCreateScreen(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateScreen.d.ts.map