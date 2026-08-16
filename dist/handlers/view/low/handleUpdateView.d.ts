/**
 * UpdateView Handler - Update ABAP View DDL Source
 *
 * Uses AdtClient.updateView from @babamba2/mcp-abap-adt-clients.
 * Low-level handler: single method call.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateViewLow";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[low-level] Update DDL source code of an existing CDS View or Classic View. Requires lock handle from LockObject. - use UpdateView (high-level) for full workflow with lock/unlock/activate.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly view_name: {
                readonly type: "string";
                readonly description: "View name (e.g., ZOK_R_TEST_0002). View must already exist.";
            };
            readonly ddl_source: {
                readonly type: "string";
                readonly description: "Complete DDL source code. CDS: include @AbapCatalog.sqlViewName and other annotations. Classic: plain 'define view' statement.";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockObject. Required for update operation.";
            };
            readonly skip_check: {
                readonly type: "boolean";
                readonly description: "Skip pre-write syntax check on ddl_source. Default: false. When false, runs a syntax check on the proposed code BEFORE uploading it and surfaces any errors with line numbers — the broken source never lands on SAP.";
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
        readonly required: readonly ["view_name", "ddl_source", "lock_handle"];
    };
};
interface UpdateViewArgs {
    view_name: string;
    ddl_source: string;
    lock_handle: string;
    skip_check?: boolean;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
/**
 * Main handler for UpdateView MCP tool
 *
 * Uses AdtClient.updateView - low-level single method call
 */
export declare function handleUpdateView(context: HandlerContext, args: UpdateViewArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateView.d.ts.map