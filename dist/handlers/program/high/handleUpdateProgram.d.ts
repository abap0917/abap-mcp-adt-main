/**
 * UpdateProgram Handler - Update Existing ABAP Program Source Code
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive) -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateProgram";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Update source code of an existing ABAP program. Locks the program, checks new code, uploads new source code, and unlocks. Optionally activates after update. Use this to modify existing programs without re-creating metadata.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Program name (e.g., Z_TEST_PROGRAM_001). Program must already exist.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Complete ABAP program source code.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate program after source update. Default: false. Set to true to activate immediately, or use ActivateObject for batch activation.";
            };
        };
        readonly required: readonly ["program_name", "source_code"];
    };
};
export declare function handleUpdateProgram(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateProgram.d.ts.map