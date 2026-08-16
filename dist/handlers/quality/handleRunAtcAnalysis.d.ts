/**
 * RunAtcAnalysis — run an ATC (ABAP Test Cockpit) check on an object and report
 * findings, via the standard ADT ATC REST endpoints:
 *   POST /sap/bc/adt/atc/runs?worklistId=<variant>   (create run)
 *   GET  /sap/bc/adt/atc/worklists/<runId>           (fetch findings)
 *
 * Ported from abap-config-mcp (abap-adt-api atc.ts).
 */
import type { HandlerContext } from '../../lib/handlers/interfaces.js';
export declare const TOOL_DEFINITION: {
    readonly name: "RunAtcAnalysis";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[quality] Run an ATC (ABAP Test Cockpit) check on an object URL and return the findings (priority, check, message, location).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_url: {
                readonly type: "string";
                readonly description: "ADT object URL to check, e.g. /sap/bc/adt/oo/classes/zcl_my_class (or programs/…/source/main for a report).";
            };
            readonly variant: {
                readonly type: "string";
                readonly description: "ATC check variant (default DEFAULT).";
                readonly default: "DEFAULT";
            };
            readonly max_results: {
                readonly type: "number";
                readonly description: "Maximum verdicts (default 100).";
                readonly default: 100;
            };
        };
        readonly required: readonly ["object_url"];
    };
};
interface AtcArgs {
    object_url: string;
    variant?: string;
    max_results?: number;
}
export declare function handleRunAtcAnalysis(context: HandlerContext, args: AtcArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleRunAtcAnalysis.d.ts.map