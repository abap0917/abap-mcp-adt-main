/**
 * UpdateGuiStatus Handler - Update an ABAP GUI Status definition
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP. Accepts full CUA data as JSON
 * and writes it via RS_CUA_INTERNAL_WRITE.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateGuiStatusLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Update an ABAP GUI Status definition. Provide full CUA data (from ReadGuiStatus) with modifications.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly cua_data: {
                readonly type: "string";
                readonly description: "Complete CUA data as JSON string (from ReadGuiStatus/GetGuiStatus). Modify and pass back.";
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
        readonly required: readonly ["program_name", "cua_data", "lock_handle"];
    };
};
interface UpdateGuiStatusArgs {
    program_name: string;
    cua_data: string;
    lock_handle: string;
    transport_request?: string;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleUpdateGuiStatus(context: HandlerContext, args: UpdateGuiStatusArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateGuiStatus.d.ts.map