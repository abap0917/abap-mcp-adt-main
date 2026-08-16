/**
 * ActivateGuiStatus Handler - Activate parent program (includes GUI statuses)
 *
 * Activates the parent program via ADT activation endpoint.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ActivateGuiStatusLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Activate an ABAP program to make GUI Status changes active.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
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
interface ActivateGuiStatusArgs {
    program_name: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleActivateGuiStatus(context: HandlerContext, args: ActivateGuiStatusArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleActivateGuiStatus.d.ts.map