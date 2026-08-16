/**
 * UpdateClass Handler - Update existing ABAP class source code (optional activation)
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive) -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateClass";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "Update source code of an existing ABAP class. Locks, checks, updates, unlocks, and optionally activates.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly class_name: {
                readonly type: "string";
                readonly description: "Class name (e.g., ZCL_TEST_CLASS_001).";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Complete ABAP class source code.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: false.";
            };
        };
        readonly required: readonly ["class_name", "source_code"];
    };
};
interface UpdateClassArgs {
    class_name: string;
    source_code: string;
    transport_request?: string;
    activate?: boolean;
}
export declare function handleUpdateClass(context: HandlerContext, params: UpdateClassArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateClass.d.ts.map