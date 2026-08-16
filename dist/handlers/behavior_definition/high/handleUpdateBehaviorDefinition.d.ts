/**
 * UpdateBehaviorDefinition Handler - ABAP Behavior Definition Update via ADT API
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateBehaviorDefinition";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Update source code of an ABAP Behavior Definition (BDEF). Modifies RAP business object behavior: CRUD operations, validations, determinations, actions, and draft handling.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Behavior Definition name";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "New source code";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockObject. If not provided, will attempt to lock internally (not recommended for stateful flows).";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: true";
            };
        };
        readonly required: readonly ["name", "source_code"];
    };
};
export declare function handleUpdateBehaviorDefinition(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateBehaviorDefinition.d.ts.map