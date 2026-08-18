/**
 * RunReport — run an ABAP report and return its LIST output.
 *
 * The in-system customizing engine executes the report with
 * `SUBMIT … EXPORTING LIST TO MEMORY` + `LIST_FROM_MEMORY` (op `run_report`)
 * and returns the captured list lines. Selection-screen values are passed as
 * RSPARAMS entries.
 *
 * ⚠️ This EXECUTES ABAP code with the connection user's authorizations — use
 * with care; gated to DEV tier by readonlyGuard.
 */
import type { HandlerContext } from '../../lib/handlers/interfaces.js';
export declare const TOOL_DEFINITION: {
    readonly name: "RunReport";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[runtime] Run an ABAP report and return its LIST output (SUBMIT … EXPORTING LIST TO MEMORY + LIST_FROM_MEMORY via the in-system engine). Selection-screen values can be passed as RSPARAMS entries (selname/kind/sign/option/low/high). Executes with the connection user's authorizations; long reports may take a while.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program: {
                readonly type: "string";
                readonly description: "ABAP report name, e.g. Z_MY_REPORT.";
            };
            readonly params: {
                readonly type: "array";
                readonly description: "Optional selection-screen values (RSPARAMS): [{selname, kind, sign, option, low, high}]. kind: P (parameter) or S (select-option); sign: I (include) / E (exclude); option: EQ/NE/CP/BT etc.; low/high: values.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly selname: {
                            readonly type: "string";
                            readonly description: "Selection-screen parameter name, e.g. P_BUKRS.";
                        };
                        readonly kind: {
                            readonly type: "string";
                            readonly enum: readonly ["P", "S"];
                            readonly description: "P = parameter, S = select-option.";
                        };
                        readonly sign: {
                            readonly type: "string";
                            readonly enum: readonly ["I", "E"];
                            readonly description: "I = include, E = exclude.";
                        };
                        readonly option: {
                            readonly type: "string";
                            readonly description: "Comparison option: EQ, NE, CP, BT, …";
                        };
                        readonly low: {
                            readonly type: "string";
                            readonly description: "Lower value.";
                        };
                        readonly high: {
                            readonly type: "string";
                            readonly description: "Upper value (for BT/option ranges).";
                        };
                    };
                    readonly required: readonly ["selname"];
                };
            };
            readonly auto_deploy: {
                readonly type: "boolean";
                readonly description: "Redeploy the engine if stale before running (default true).";
                readonly default: true;
            };
        };
        readonly required: readonly ["program"];
    };
};
interface RsparEntry {
    selname: string;
    kind?: 'P' | 'S';
    sign?: 'I' | 'E';
    option?: string;
    low?: string;
    high?: string;
}
interface RunReportArgs {
    program: string;
    params?: RsparEntry[];
    auto_deploy?: boolean;
}
export declare function handleRunReport(context: HandlerContext, args: RunReportArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleRunReport.d.ts.map