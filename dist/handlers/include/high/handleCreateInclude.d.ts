/**
 * CreateInclude Handler - Create a new ABAP Include Program (Type I)
 *
 * Uses direct ADT REST API since AdtClient doesn't have a dedicated include client.
 * ADT endpoint: POST /sap/bc/adt/programs/includes
 *
 * Creates the include object in initial state (no source code) and registers it
 * in D010INC under the specified main program. Optionally auto-inserts an
 * `INCLUDE <name>.` statement into the main program source.
 *
 * Note: CreateProgram with program_type='include' creates a PROG/P (report) object,
 * NOT a PROG/I include. This handler creates a proper PROG/I include.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateInclude";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Create a new ABAP Include program (Type I, PROG/I) in SAP system. Creates the include object and registers it under the main program in D010INC. By default also auto-inserts an `INCLUDE <name>.` statement into the main program source so the include is actually used. Use UpdateInclude to set source code afterwards. Unlike CreateProgram with program_type=include (which creates PROG/P), this creates a proper PROG/I include. For mass-activation scenarios (many cross-referencing includes) pass source_code inline, set activate_main_program=false and skip_program_tree_check=true, then call ActivateObjects once with the full set.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly include_name: {
                readonly type: "string";
                readonly description: "Include program name (e.g., ZPAEK_TEST_INC01). Must follow SAP naming conventions (start with Z or Y).";
            };
            readonly main_program: {
                readonly type: "string";
                readonly description: "Name of the main/master program that will contain this include (e.g., ZPAEK_TEST003). Required for proper include registration and activation.";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Include description (max 60 chars). If not provided, include_name will be used.";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name (e.g., ZOK_LAB, $TMP for local objects).";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., S4HK904224). Required for transportable packages. Optional for local ($TMP) objects.";
            };
            readonly insert_into_main: {
                readonly type: "boolean";
                readonly description: "Auto-insert `INCLUDE <name>.` statement into the main program source. Default: true. Set false to skip main-program modification.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Optional include body. When provided, the handler also locks, writes the source, and unlocks the new include in a single call. Never activates — caller must run a separate activation (ActivateObjects for batch scenarios).";
            };
            readonly activate_main_program: {
                readonly type: "boolean";
                readonly description: "When inserting INCLUDE statement into the main program, also activate the main program afterwards. Default: true (existing behavior). Set false when batching many includes so that activation is deferred to a single ActivateObjects call.";
            };
            readonly skip_program_tree_check: {
                readonly type: "boolean";
                readonly description: "Skip the post-create program-tree syntax check. Default: false (existing behavior). Set true when batching many cross-referencing includes — an intermediate include in a cycle will necessarily fail the tree check while its siblings are still missing.";
            };
        };
        readonly required: readonly ["include_name", "main_program", "package_name"];
    };
};
export declare function handleCreateInclude(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateInclude.d.ts.map