/**
 * ImgSearch — search SPRO/IMG activities by keyword.
 *
 * Ported from abap-config-mcp. Prefers the STREE/SHI search-text index (via the
 * deployed customizing engine's img_index_read op); falls back to the raw
 * CUS_IMGACT / CUS_ACTOBJ tables when no index/engine is available.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ImgSearch";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Search SAP IMG/SPRO activities by keyword (activity title). Prefers the STREE search-text index when the customizing engine is deployed; falls back to the raw CUS_IMGACT tables. Pass a namespace (e.g. \"/POSDW/\") to scope the raw search — free-text SQL is blocked on this system.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly keyword: {
                readonly type: "string";
                readonly description: "Keyword to match against IMG activity titles.";
            };
            readonly namespace: {
                readonly type: "string";
                readonly description: "Activity-ID prefix to scope the raw search by, e.g. \"/POSDW/\" (omit for best-effort full scan).";
            };
            readonly in_scope_only: {
                readonly type: "boolean";
                readonly description: "Keep only activities in the client's activated scope (CUS_IMGACH_SCOPE).";
                readonly default: false;
            };
            readonly language: {
                readonly type: "string";
                readonly description: "IMG language (default E).";
                readonly default: "E";
            };
            readonly max_results: {
                readonly type: "number";
                readonly description: "Maximum hits (default 200).";
                readonly default: 200;
            };
        };
        readonly required: readonly ["keyword"];
    };
};
interface ImgSearchArgs {
    keyword: string;
    namespace?: string;
    in_scope_only?: boolean;
    language?: string;
    max_results?: number;
}
export declare function handleImgSearch(context: HandlerContext, args: ImgSearchArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleImgSearch.d.ts.map