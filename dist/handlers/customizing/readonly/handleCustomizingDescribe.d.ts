/**
 * CustomizingDescribe — describe a customizing object: maintenance view/table
 * set, key fields, auth group, IMG activity and the official transport object.
 *
 * Ported from abap-config-mcp.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CustomizingDescribe";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Describe a customizing object (maintenance view or config table): full table set (base + text), key fields, auth group, IMG activity, delivery class and the R3TR transport object (VDAT/TABU/CDAT).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view name (TVDIR) or base table name (DD02L), e.g. V_T001 or T001.";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "Description language (default E).";
                readonly default: "E";
            };
        };
        readonly required: readonly ["object_name"];
    };
};
interface DescribeArgs {
    object_name: string;
    language?: string;
}
export declare function handleCustomizingDescribe(context: HandlerContext, args: DescribeArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleCustomizingDescribe.d.ts.map