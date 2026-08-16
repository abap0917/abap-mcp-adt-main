/**
 * GetTextElement Handler (High-level) - Read ABAP program text pool
 *
 * Uses ZMCP_ADT_TEXTPOOL RFC via SOAP (READ action).
 * Text pool rows are text symbols ('I'), selection texts ('S'),
 * report title ('R') and list headings ('H'). Optionally filters
 * by text_type and key.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetTextElement";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Read ABAP program text pool (text symbols, selection texts, title, headings). Optionally filter by text_type / key.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Program name (e.g., Z_MY_PROGRAM).";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "Language key (1-char, e.g., \"E\", \"D\", \"K\"). Defaults to the SAP logon language.";
            };
            readonly text_type: {
                readonly type: "string";
                readonly description: "Filter by ID: \"I\"=text symbol, \"S\"=selection text, \"R\"=program title, \"H\"=list heading.";
                readonly enum: readonly ["I", "S", "R", "H"];
            };
            readonly key: {
                readonly type: "string";
                readonly description: "Optional: filter by row key (e.g., \"001\" for text symbol TEXT-001, or a parameter name for selection text).";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
export declare function handleGetTextElement(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetTextElement.d.ts.map