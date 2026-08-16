/**
 * DeleteObject Handler - Delete ABAP objects via ADT API
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteObjectLow";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[low-level] Delete an ABAP object via ADT deletion API. Transport request optional for $TMP objects.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Object name (e.g., ZCL_MY_CLASS)";
            };
            readonly object_type: {
                readonly type: "string";
                readonly description: "Object type (class/program/interface/function_group/function_module/table/structure/view/domain/data_element/behavior_definition/metadata_extension)";
            };
            readonly function_group_name: {
                readonly type: "string";
                readonly description: "Required only for function_module type";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number";
            };
        };
        readonly required: readonly ["object_name", "object_type"];
    };
};
interface DeleteObjectArgs {
    object_name: string;
    object_type: string;
    function_group_name?: string;
    transport_request?: string;
}
export declare function handleDeleteObject(context: HandlerContext, args: DeleteObjectArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleDeleteObject.d.ts.map