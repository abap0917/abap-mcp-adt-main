/**
 * WriteTextElementsBulk — register many text elements in a SINGLE call.
 *
 * Previously a 40-element load meant 40 separate tool invocations of
 * CreateTextElement, each doing its own LOCK / RFC READ / RFC WRITE /
 * UNLOCK cycle → 160+ round-trips and a read-then-write race when
 * parallelized. This handler folds every entry (R / I / S / H) into a
 * single `ZMCP_ADT_TEXTPOOL` RFC call.
 *
 * SAP's native pattern for TPOOL is a whole-pool INSERT (what SE38 → GoTo
 * → Text Elements does internally). We follow the same pattern:
 *
 *   activate=true  → RFC action 'WRITE'           (INSERT TEXTPOOL STATE 'A')
 *                    Pool is written active immediately.
 *   activate=false → RFC action 'WRITE_INACTIVE'  (INSERT TEXTPOOL STATE 'I')
 *                    Pool is staged inactive; the next activation of the
 *                    parent program promotes it atomically — every R / I /
 *                    S / H entry goes live together, matching the user's
 *                    "register 40 now, activate program later" flow.
 *
 * replace_existing=false re-reads the current pool first and merges the
 * caller's entries by (ID, KEY) so nothing outside the caller's set is
 * wiped.
 *
 * Existing CreateTextElement / UpdateTextElement tools remain untouched.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "WriteTextElementsBulk";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Register many ABAP text elements (R/I/S/H) in ONE tool call via a single TPOOL RFC write. Use instead of calling CreateTextElement N times. With activate=false (default) the pool is staged INACTIVE — the parent program's next activation promotes every entry atomically, which is the correct flow for \"register 40 now, activate program later\". With activate=true the pool is written ACTIVE immediately. Set replace_existing=false to merge into the current pool instead of replacing it.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "1-char language key (e.g. \"K\" for Korean). Defaults to SAP logon language.";
            };
            readonly text_elements: {
                readonly type: "array";
                readonly minItems: 1;
                readonly description: "Array of entries. Each: { type: \"R\"|\"I\"|\"S\"|\"H\", key?: string, text: string }. R ignores key (single-row program title — key defaults to program name). I requires a 3-char key. S requires a parameter / select-option name (max 8 chars). H requires one of \"listHeader\" or \"columnHeader_N\".";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly type: {
                            readonly type: "string";
                            readonly enum: readonly ["R", "I", "S", "H"];
                        };
                        readonly key: {
                            readonly type: "string";
                        };
                        readonly text: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["type", "text"];
                };
            };
            readonly replace_existing: {
                readonly type: "boolean";
                readonly description: "If true (default), the TPOOL is replaced with the provided entries only. If false, existing rows are preserved and provided rows merge by (type, key).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (informational).";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "false (default) — stage as INACTIVE (program activation promotes). true — write ACTIVE immediately.";
            };
        };
        readonly required: readonly ["program_name", "text_elements"];
    };
};
export declare function handleWriteTextElementsBulk(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleWriteTextElementsBulk.d.ts.map