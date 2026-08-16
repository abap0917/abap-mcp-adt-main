/**
 * ReadScreen Handler - Read ABAP Screen (Dynpro) flow logic and metadata
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RPY_DYNPRO_READ.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadScreen";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[read-only] Read ABAP Screen (Dynpro) flow logic source code, fields, and metadata.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., SAPMV45A).";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number (e.g., 0100).";
            };
        };
        readonly required: readonly ["program_name", "screen_number"];
    };
};
export declare function handleReadScreen(context: HandlerContext, args: {
    program_name: string;
    screen_number: string;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadScreen.d.ts.map