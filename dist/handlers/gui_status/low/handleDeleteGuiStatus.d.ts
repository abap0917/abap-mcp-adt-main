/**
 * DeleteGuiStatus Handler - Delete an ABAP GUI Status
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RS_CUA_DELETE.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteGuiStatusLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Delete an ABAP GUI Status from a program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly status_name: {
                readonly type: "string";
                readonly description: "GUI Status name to delete. Use \"*\" to delete all.";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockGuiStatusLow.";
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
        readonly required: readonly ["program_name", "status_name", "lock_handle"];
    };
};
interface DeleteGuiStatusArgs {
    program_name: string;
    status_name: string;
    lock_handle: string;
    transport_request?: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleDeleteGuiStatus(context: HandlerContext, args: DeleteGuiStatusArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleDeleteGuiStatus.d.ts.map