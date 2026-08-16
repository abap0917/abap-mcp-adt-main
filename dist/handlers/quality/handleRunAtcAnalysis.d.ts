/**
 * RunAtcAnalysis — ATC (ABAP Test Cockpit) findings tool.
 *
 * Three modes:
 *   1. `object_url`  — create a new ATC run for an object and return findings
 *      (POST /sap/bc/adt/atc/runs?worklistId=<variant> → GET worklists/<runId>).
 *   2. `run_id`      — fetch the worklist of an existing ATC run by its
 *      worklist ID (GET /sap/bc/adt/atc/worklists/<runId>).
 *   3. `display_id`  — fetch a saved ATC result by its display ID
 *      (GET /sap/bc/adt/atc/results/<displayId>, Accept: application/xml).
 *      Display IDs are the ones returned by the ATC results list (e.g. the
 *      "ATC Results" view / /sap/bc/adt/atc/results feed).
 *
 * Ported from abap-config-mcp (abap-adt-api atc.ts).
 */
import type { HandlerContext } from '../../lib/handlers/interfaces.js';
export declare const TOOL_DEFINITION: {
    readonly name: "RunAtcAnalysis";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[quality] ATC (ABAP Test Cockpit) findings. Provide object_url to run a new check, run_id to fetch an existing run worklist by its worklist ID, or display_id to fetch a saved ATC result by display ID. Returns priority, check, message, location.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_url: {
                readonly type: "string";
                readonly description: "ADT object URL to check, e.g. /sap/bc/adt/oo/classes/zcl_my_class (or programs/…/source/main for a report).";
            };
            readonly run_id: {
                readonly type: "string";
                readonly description: "Existing ATC run worklist ID to fetch findings for (skip run creation).";
            };
            readonly display_id: {
                readonly type: "string";
                readonly description: "Saved ATC result display ID to fetch findings for (from the ATC results list, e.g. \"59D32AF578641FE1A5EE3789C160133D\").";
            };
            readonly variant: {
                readonly type: "string";
                readonly description: "ATC check variant (default DEFAULT).";
                readonly default: "DEFAULT";
            };
            readonly max_results: {
                readonly type: "number";
                readonly description: "Maximum verdicts to return (default 100).";
                readonly default: 100;
            };
        };
        readonly required: readonly [];
    };
};
interface AtcArgs {
    object_url?: string;
    run_id?: string;
    display_id?: string;
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