/**
 * GetTransport Handler - Retrieve ABAP transport request information via ADT API
 *
 * ADT exposes TWO transport endpoints with different semantics per backend:
 *
 *   1. Path-based single-TR read:   GET /sap/bc/adt/cts/transportrequests/<NUMBER>
 *        Accept: application/vnd.sap.adt.transportorganizer.v1+xml
 *      S/4HANA: returns the TR natively ({tm:root adtcore:name=<NUMBER> > tm:request}).
 *      ECC:     path segment is effectively ignored — response is a user-scoped LIST
 *               ({tm:root adtcore:name=<USER> > tm:workbench > tm:modifiable > tm:request[]}).
 *
 *   2. List-by-user:                GET /sap/bc/adt/cts/transportrequests?user=<OWNER>
 *        Accept: application/vnd.sap.adt.transportorganizertree.v1+xml
 *      Both: list scoped to the owning user.
 *
 * Strategy: path URL first (native on S/4, acceptable fallback on ECC). If the TR is
 * not found in the path response AND `owner` was supplied, retry with the list URL
 * (handles cross-user queries, especially on ECC where the path URL only reveals the
 * session user's list).
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetTransport";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Retrieve ABAP transport request information including metadata, included objects, and status from SAP system.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly transport_number: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635, DEVK905123)";
            };
            readonly owner: {
                readonly type: "string";
                readonly description: "SAP user who owns the transport. On ECC the session-user-scoped path endpoint silently filters out other users' TRs — pass `owner` to retry via the list endpoint. On S/4 usually unnecessary, but provide it if the path read is rejected by authorization.";
            };
            readonly include_objects: {
                readonly type: "boolean";
                readonly description: "Include list of objects in transport (default: true)";
                readonly default: true;
            };
            readonly include_tasks: {
                readonly type: "boolean";
                readonly description: "Include list of tasks in transport (default: true)";
                readonly default: true;
            };
        };
        readonly required: readonly ["transport_number"];
    };
};
interface GetTransportArgs {
    transport_number: string;
    owner?: string;
    include_objects?: boolean;
    include_tasks?: boolean;
}
/**
 * Main handler for GetTransport MCP tool.
 * Strategy: path-based read first, list-by-user fallback when owner is supplied.
 */
export declare function handleGetTransport(context: HandlerContext, args: GetTransportArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleGetTransport.d.ts.map