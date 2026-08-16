/**
 * GetScreensList Handler - List screens (dynpros) for an ABAP program
 *
 * Uses ADT object structure API to discover screens (PROG/PS nodes).
 * Direct REST sub-resource endpoints (/dynpros) don't exist in ADT.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetScreensList";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[read-only] List all screens (dynpros) belonging to an ABAP program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Program name (e.g., SAPMV45A).";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
export declare function handleGetScreensList(context: HandlerContext, args: {
    program_name: string;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetScreensList.d.ts.map