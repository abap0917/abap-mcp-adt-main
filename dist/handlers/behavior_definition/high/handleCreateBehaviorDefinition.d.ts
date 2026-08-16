/**
 * CreateBehaviorDefinition Handler - ABAP Behavior Definition Creation via ADT API
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateBehaviorDefinition";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP Behavior Definition (BDEF) in SAP system. Defines RAP business object behavior: CRUD operations, validations, determinations, actions, and draft handling.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Behavior Definition name (usually same as Root Entity name)";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Description";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number";
            };
            readonly root_entity: {
                readonly type: "string";
                readonly description: "Root Entity name (CDS View name)";
            };
            readonly implementation_type: {
                readonly type: "string";
                readonly description: "Implementation type: 'Managed', 'Unmanaged', 'Abstract', 'Projection'";
                readonly enum: readonly ["Managed", "Unmanaged", "Abstract", "Projection"];
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after creation. Default: true";
            };
        };
        readonly required: readonly ["name", "package_name", "root_entity", "implementation_type"];
    };
};
export declare function handleCreateBehaviorDefinition(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateBehaviorDefinition.d.ts.map