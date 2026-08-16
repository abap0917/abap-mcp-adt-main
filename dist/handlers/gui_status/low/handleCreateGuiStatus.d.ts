/**
 * CreateGuiStatus Handler - Create a new ABAP GUI Status
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP. Fetches existing CUA data,
 * adds the new status entry, and writes back.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateGuiStatusLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Create a new ABAP GUI Status on an existing program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name (e.g., Z_MY_PROGRAM).";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "GUI Status name to create (e.g., MAIN_STATUS).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "GUI Status description.";
            };
            readonly status_type: {
                readonly type: "string";
                readonly description: "Status type: \"N\" (normal/dialog), \"P\" (popup/dialog box), \"C\" (context menu). Default: \"N\".";
                readonly enum: readonly ["N", "P", "C"];
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
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
        readonly required: readonly ["program_name", "status_name"];
    };
};
interface CreateGuiStatusArgs {
    program_name: string;
    status_name: string;
    description?: string;
    status_type?: string;
    transport_request?: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleCreateGuiStatus(context: HandlerContext, args: CreateGuiStatusArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleCreateGuiStatus.d.ts.map