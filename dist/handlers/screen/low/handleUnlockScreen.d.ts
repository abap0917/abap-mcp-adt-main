/**
 * UnlockScreen Handler - Unlock parent program after Screen modification
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UnlockScreenLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Unlock a program after Screen modification.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
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
        readonly required: readonly ["program_name", "lock_handle"];
    };
};
interface UnlockScreenArgs {
    program_name: string;
    lock_handle: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleUnlockScreen(context: HandlerContext, args: UnlockScreenArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUnlockScreen.d.ts.map