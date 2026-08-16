/**
 * CreateTextElement Handler (High-level) - Add a text element row
 *
 * Uses ZMCP_ADT_TEXTPOOL RFC (READ + WRITE) via SOAP. INSERT TEXTPOOL
 * fully replaces the language-specific pool, so we fetch the current
 * rows, append the new one, write the complete array back, and
 * optionally activate the parent program.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateTextElement";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Add a text element (text symbol, selection text, program title, or list heading) to an ABAP program. Optionally activates after write.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., Z_MY_PROGRAM).";
            };
            readonly text_type: {
                readonly type: "string";
                readonly description: "\"I\"=text symbol (TEXT-xxx), \"S\"=selection text, \"R\"=program title, \"H\"=list heading.";
                readonly enum: readonly ["I", "S", "R", "H"];
            };
            readonly key: {
                readonly type: "string";
                readonly description: "Row key. For \"I\" use 3-char code (e.g., \"001\"). For \"S\" use the parameter/select-option name. For \"R\" the key is ignored (single row).";
            };
            readonly text: {
                readonly type: "string";
                readonly description: "Text content (max 132 characters).";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "Language key (1-char). Defaults to SAP logon language.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate the parent program after write. Default: false.";
            };
        };
        readonly required: readonly ["program_name", "text_type", "text"];
    };
};
export declare function handleCreateTextElement(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateTextElement.d.ts.map