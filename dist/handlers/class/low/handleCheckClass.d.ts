/**
 * CheckClass Handler - Syntax check for ABAP class via ADT API
 *
 * Uses checkClass from @babamba2/mcp-abap-adt-clients/core/class for class-specific checking.
 * Supports checking existing classes or hypothetical source code.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CheckClassLow";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[low-level] Perform syntax check on an ABAP class. Can check existing class (active/inactive) or hypothetical source code. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly class_name: {
                readonly type: "string";
                readonly description: "Class name (e.g., ZCL_MY_CLASS)";
            };
            readonly version: {
                readonly type: "string";
                readonly description: "Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active";
                readonly enum: readonly ["active", "inactive"];
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Optional: source code to validate. If provided, validates hypothetical code without creating object. Must include complete CLASS DEFINITION and IMPLEMENTATION sections.";
            };
            readonly session_id: {
                readonly type: "string";
                readonly description: "Session ID from GetSession. If not provided, a new session will be created.";
            };
            readonly session_state: {
                readonly type: "object";
                readonly description: "Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.";
                readonly properties: {
                    readonly cookies: {
                        readonly type: "string";
                    };
                    readonly csrf_token: {
                        readonly type: "string";
                    };
                    readonly cookie_store: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly required: readonly ["class_name"];
    };
};
interface CheckClassArgs {
    class_name: string;
    version?: string;
    source_code?: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
/**
 * Main handler for CheckClass MCP tool
 */
export declare function handleCheckClass(context: HandlerContext, args: CheckClassArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleCheckClass.d.ts.map