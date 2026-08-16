/**
 * GetScreen Handler - Get ABAP Screen (Dynpro) with metadata and flow logic
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RPY_DYNPRO_READ.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetScreen";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Get ABAP Screen (Dynpro) definition including metadata, fields, and flow logic source code.";
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
export declare function handleGetScreen(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetScreen.d.ts.map