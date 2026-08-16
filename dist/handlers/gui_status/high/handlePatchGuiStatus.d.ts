/**
 * PatchGuiStatus — safer alternative to UpdateGuiStatus.
 *
 * Fetches the current active CUA for the program, row-level merges the
 * caller-supplied `changes` into it, and writes the merged result back.
 * Rows and fields the caller didn't touch are preserved verbatim — so
 * sending `{ FUN: [{ CODE: 'BACK', ICON_ID: '@03@' }] }` only updates the
 * BACK function's icon and leaves everything else intact.
 *
 * This is the footgun-proof equivalent of UpdateGuiStatus for targeted
 * edits. UpdateGuiStatus remains available for callers that genuinely
 * need full-replace semantics.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "PatchGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Row-level merge into an existing ABAP GUI Status definition. Fetches current CUA → merges the caller-supplied changes (by natural key) → writes merged result back. Rows / fields you omit are preserved. Safer default for targeted edits; use UpdateGuiStatus only when you truly want to replace the whole CUA.\n\nMerge keys per table:\n  STA=CODE, FUN=CODE, PFK=CODE+PFNO, BUT=PFK_CODE+CODE+NO, TIT=CODE,\n  MEN=CODE+NO, MTX=CODE, ACT=CODE+NO, SET=STATUS+FUNCTION,\n  DOC=OBJ_TYPE+OBJ_CODE, BIV=CODE+POS.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly changes: {
                readonly description: "Partial CUA data to merge into the current definition. Same shape as cua_data (ADM / STA / FUN / MEN / MTX / ACT / BUT / PFK / SET / DOC / TIT / BIV). Accepts JSON string or object. Rows matched by natural key are field-merged (changes win). New rows are appended. Omitted tables are left untouched.";
                readonly oneOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "object";
                }];
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after patch. Default: false.";
            };
            readonly skip_validation: {
                readonly type: "boolean";
                readonly description: "Skip client-side validation of the merged result. Default: false.";
            };
        };
        readonly required: readonly ["program_name", "changes"];
    };
};
export declare function handlePatchGuiStatus(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handlePatchGuiStatus.d.ts.map