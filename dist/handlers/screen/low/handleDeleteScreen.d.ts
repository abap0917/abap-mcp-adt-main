/**
 * DeleteScreen Handler (Low-level) - Delete an ABAP Screen via RFC
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteScreenLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Delete an ABAP Screen (Dynpro) from a program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number (e.g., 0100).";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockScreenLow.";
            };
            readonly session_id: {
                readonly type: "string";
                readonly description: "Session ID from GetSession.";
            };
            readonly session_state: {
                readonly type: "object";
                readonly description: "Session state from GetSession.";
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
        readonly required: readonly ["program_name", "screen_number", "lock_handle"];
    };
};
interface DeleteScreenArgs {
    program_name: string;
    screen_number: string;
    lock_handle: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleDeleteScreen(context: HandlerContext, args: DeleteScreenArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleDeleteScreen.d.ts.map