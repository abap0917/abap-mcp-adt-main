/**
 * CustomizingDiff / CustomizingPlanChange — compare configuration between two
 * org-unit key values, and dry-run the rows a copy would write.
 *
 * Ported from abap-config-mcp.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
interface CompareArgs {
    object_name: string;
    key_field: string;
    source_key: string;
    target_key: string;
    values?: Array<{
        field: string;
        value: string;
    }>;
}
export declare function handleCustomizingDiff(context: HandlerContext, args: CompareArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleCustomizingPlanChange(context: HandlerContext, args: CompareArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const TOOL_DEFINITIONS: ({
    readonly name: "CustomizingDiff";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Compare customizing rows between two org-unit key values of the same config object (e.g. company code 1000 vs 2000).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view or base table, e.g. T001 / V_T001.";
            };
            readonly key_field: {
                readonly type: "string";
                readonly description: "Org-unit key field, e.g. BUKRS, WERKS, VKORG.";
            };
            readonly source_key: {
                readonly type: "string";
                readonly description: "Source org-unit value (e.g. \"1000\").";
            };
            readonly target_key: {
                readonly type: "string";
                readonly description: "Target org-unit value (e.g. \"2000\").";
            };
        };
        readonly required: readonly ["object_name", "key_field", "source_key", "target_key"];
    };
} | {
    readonly name: "CustomizingPlanChange";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Dry-run plan of a config copy: the exact rows that would be written when copying sourceKey → targetKey (with optional field overrides). Nothing is written.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view or base table.";
            };
            readonly key_field: {
                readonly type: "string";
                readonly description: "Org-unit key field.";
            };
            readonly source_key: {
                readonly type: "string";
                readonly description: "Source org-unit value.";
            };
            readonly target_key: {
                readonly type: "string";
                readonly description: "Target org-unit value.";
            };
            readonly values: {
                readonly type: "array";
                readonly description: "Optional [{field, value}] overrides applied to every planned row.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly field: {
                            readonly type: "string";
                        };
                        readonly value: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["field", "value"];
                };
            };
        };
        readonly required: readonly ["object_name", "key_field", "source_key", "target_key"];
    };
})[];
export {};
//# sourceMappingURL=handleCustomizingCompare.d.ts.map