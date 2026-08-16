/**
 * CustomizingRead — read customizing rows for an org-unit key (or first N rows).
 *
 * Ported from abap-config-mcp (formatQueryResult-style output).
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CustomizingRead";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Read current customizing data for a config object (maintenance view or table), optionally filtered by an org-unit key field value.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view or base table, e.g. V_T001 / T001 / V_T001W.";
            };
            readonly key_field: {
                readonly type: "string";
                readonly description: "Key field to filter on (e.g. BUKRS, WERKS, VKORG). Omit to read the first rows.";
            };
            readonly key_value: {
                readonly type: "string";
                readonly description: "Key field value to filter on (e.g. \"1000\").";
            };
            readonly max_rows: {
                readonly type: "number";
                readonly description: "Maximum rows (default 100).";
                readonly default: 100;
            };
        };
        readonly required: readonly ["object_name"];
    };
};
interface ReadArgs {
    object_name: string;
    key_field?: string;
    key_value?: string;
    max_rows?: number;
}
export declare function handleCustomizingRead(context: HandlerContext, args: ReadArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleCustomizingRead.d.ts.map