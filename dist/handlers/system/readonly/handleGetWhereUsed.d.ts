/**
 * WhereUsed handler using AdtClient utilities
 * Endpoint: /sap/bc/adt/repository/informationsystem/usageReferences
 * Uses getWhereUsedList for parsed results
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetWhereUsed";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Find where-used references (cross-references, usages, dependencies) for ABAP objects — classes, interfaces, tables, data elements, programs, function modules, etc. Returns list of all referencing objects with their types and packages.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Name of the ABAP object";
            };
            readonly object_type: {
                readonly type: "string";
                readonly description: "Type of the ABAP object (class, interface, program, table, etc.)";
            };
            readonly enable_all_types: {
                readonly type: "boolean";
                readonly description: "If true, searches in all available object types (Eclipse 'select all' behavior). Default: false (uses SAP default scope)";
                readonly default: false;
            };
        };
        readonly required: readonly ["object_name", "object_type"];
    };
};
interface WhereUsedArgs {
    object_name: string;
    object_type: string;
    enable_all_types?: boolean;
}
/**
 * Returns where-used references for ABAP objects using AdtClient utilities.
 * Uses getWhereUsedList for parsed structured results.
 */
export declare function handleGetWhereUsed(context: HandlerContext, args: WhereUsedArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        json: {
            object_name: string;
            object_type: string;
            enable_all_types: boolean;
            total_references: number;
            result_description: string;
            references: {
                name: string;
                type: string;
                uri: string;
                package_name: string | undefined;
                responsible: string | undefined;
                usage_information: string | undefined;
            }[];
        };
    }[];
} | {
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleGetWhereUsed.d.ts.map