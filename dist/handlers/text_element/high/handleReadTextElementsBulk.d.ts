/**
 * ReadTextElementsBulk — return every text element of a program in ONE call.
 *
 * Matches WriteTextElementsBulk semantics: we read the whole TPOOL via the
 * `ZMCP_ADT_TEXTPOOL` RFC (single SAP round-trip) and partition the rows
 * by ID (R / I / S / H). The native /textelements subsource endpoints
 * exist but only surface the editor-view of I/S/H and don't expose R at
 * all, so using TPOOL RFC directly keeps this tool aligned with the
 * WriteTextElementsBulk storage path and exposes every type uniformly.
 *
 * Existing single-row GetTextElement stays row-by-row for callers that
 * want one entry.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadTextElementsBulk";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Read every text element (R/I/S/H) of a program in ONE call via the TPOOL RFC. Partitions rows by type and returns structured arrays. Use this instead of calling GetTextElement per row.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Program name.";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "1-char language. Defaults to SAP logon language.";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
export declare function handleReadTextElementsBulk(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadTextElementsBulk.d.ts.map