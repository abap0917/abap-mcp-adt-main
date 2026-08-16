/**
 * ActivateScreen Handler - Activate parent program (includes screens)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ActivateScreenLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Activate an ABAP program to make Screen changes active.";
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
interface ActivateScreenArgs {
    program_name: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleActivateScreen(context: HandlerContext, args: ActivateScreenArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleActivateScreen.d.ts.map