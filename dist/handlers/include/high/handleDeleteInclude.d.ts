/**
 * DeleteInclude Handler - Delete ABAP Include Program (Type I)
 *
 * Uses direct ADT REST API since AdtClient doesn't have include methods.
 * ADT endpoint: DELETE /sap/bc/adt/programs/includes/{name}
 *
 * Optionally removes the `INCLUDE <name>.` statement from the main program
 * source BEFORE deletion (to avoid SAP rejecting the delete because the
 * include is still referenced).
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteInclude";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Delete an existing ABAP Include program (Type I) from the SAP system via ADT API. If the include is referenced by a main program, provide main_program so the handler can first remove the `INCLUDE <name>.` line from the main program source before deleting.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly include_name: {
                readonly type: "string";
                readonly description: "Include program name to delete.";
            };
            readonly main_program: {
                readonly type: "string";
                readonly description: "Optional. Name of the main program referencing this include. If provided, the `INCLUDE <name>.` line is removed from the main program source first (so the include is no longer referenced and delete succeeds).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number. Required for transportable packages. Optional for local ($TMP) objects. Also used for updating the main program if main_program is provided.";
            };
            readonly remove_from_main: {
                readonly type: "boolean";
                readonly description: "Auto-remove `INCLUDE <name>.` line from main program source. Default: true when main_program is provided. Set false to skip the main-program modification.";
            };
        };
        readonly required: readonly ["include_name"];
    };
};
export declare function handleDeleteInclude(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleDeleteInclude.d.ts.map