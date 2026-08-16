/**
 * UpdateScreen Handler (Low-level) - Update ABAP Screen flow logic via RFC
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP. Deletes + re-inserts screen
 * since RPY_DYNPRO_INSERT is the standard update mechanism.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateScreenLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Update an ABAP Screen (Dynpro) definition. Provide full screen data as JSON.";
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
            readonly dynpro_data: {
                readonly type: "string";
                readonly description: "Complete screen definition as JSON (header, containers, fields_to_containers, flow_logic).";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockScreenLow.";
            };
            readonly skip_check: {
                readonly type: "boolean";
                readonly description: "Skip post-write syntax check. Default: false. When false, runs a program-tree syntax check on the parent program after DYNPRO_INSERT and surfaces any flow-logic errors with line numbers.";
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
        readonly required: readonly ["program_name", "screen_number", "dynpro_data", "lock_handle"];
    };
};
interface UpdateScreenArgs {
    program_name: string;
    screen_number: string;
    dynpro_data: string;
    lock_handle: string;
    skip_check?: boolean;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleUpdateScreen(context: HandlerContext, args: UpdateScreenArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateScreen.d.ts.map