/**
 * LockGuiStatus Handler - Lock parent program for GUI Status modification
 *
 * Locks the parent program via ADT since GUI statuses don't have
 * their own ADT lock endpoints. Returns lock handle for update/delete.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "LockGuiStatusLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Lock a program for GUI Status modification. Returns lock handle for subsequent update/unlock operations.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., SAPMV45A).";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "GUI Status name (for reference only).";
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
        readonly required: readonly ["program_name"];
    };
};
interface LockGuiStatusArgs {
    program_name: string;
    status_name?: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleLockGuiStatus(context: HandlerContext, args: LockGuiStatusArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleLockGuiStatus.d.ts.map