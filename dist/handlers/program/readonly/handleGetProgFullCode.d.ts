/**
 * handleGetProgFullCode: returns full code for program (report) or function group with all includes.
 *
 * Description for MCP server:
 * Name: Get full code for program or function group
 * Description: Returns the full code for a given ABAP program (report) or function group, including all includes. The main object (report or function group) always comes first in the response, followed by all child includes in tree traversal order.
 *
 * Parameters:
 * - name: technical name of the program or function group (string, e.g., "/CBY/MM_INVENTORY") — required
 * - type: "PROG/P" for program or "FUGR" for function group (string, required)
 *
 * Returns: JSON:
 *   {
 *     name: string, // technical name of the main object
 *     type: string, // "PROG/P" or "FUGR"
 *     total_code_objects: number, // total number of code objects (main + all includes)
 *     code_objects: [
 *       {
 *         OBJECT_TYPE: string, // "PROG/P" (main program), "FUGR" (function group), or "PROG/I" (include)
 *         OBJECT_NAME: string, // technical name of the object
 *         code: string         // full ABAP source code of the object (entire code, not a fragment)
 *       }
 *     ]
 *   }
 *
 * Notes:
 * - The "code" field always contains the full source code for each object (not truncated).
 * - All includes are resolved recursively and added after the main object.
 * - The order is: main object first, then all includes in tree traversal order.
 * - If the object or code is not found, an error is returned.
 *
 * Purpose: mass code export, audit, dependency analysis, migration, backup.
 */
export declare const TOOL_DEFINITION: {
    readonly name: "GetProgFullCode";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[read-only] Returns the full code for a program or function group, including all includes, in tree traversal order.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "[read-only] Technical name of the program or function group (e.g., '/CBY/MM_INVENTORY')";
            };
            readonly type: {
                readonly type: "string";
                readonly enum: readonly ["PROG/P", "FUGR"];
                readonly description: "[read-only] 'PROG/P' for program or 'FUGR' for function group";
            };
        };
        readonly required: readonly ["name", "type"];
    };
};
import type { HandlerContext } from '../../../lib/handlers/interfaces';
/**
 * handleGetProgFullCode: returns full code for program (report) or function group with all includes.
 * @param args { name: string, type: "PROG/P" | "FUGR" }
 */
export declare function handleGetProgFullCode(context: HandlerContext, args: {
    name: string;
    type: string;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=handleGetProgFullCode.d.ts.map