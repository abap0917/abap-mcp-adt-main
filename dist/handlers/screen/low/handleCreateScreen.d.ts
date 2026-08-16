/**
 * CreateScreen Handler (Low-level) - Create a new ABAP Screen via RFC
 *
 * Uses ZMCP_ADT_DISPATCH RFC via SOAP to call RPY_DYNPRO_INSERT.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateScreenLow";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[low-level] Create a new ABAP Screen (Dynpro) on an existing program.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly screen_number: {
                readonly type: "string";
                readonly description: "Screen number to create (e.g., 0100).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Screen description.";
            };
            readonly dynpro_data: {
                readonly type: "string";
                readonly description: "Full screen definition as JSON (header, containers, fields_to_containers, flow_logic). If omitted, creates a minimal empty screen.";
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
        readonly required: readonly ["program_name", "screen_number"];
    };
};
interface CreateScreenArgs {
    program_name: string;
    screen_number: string;
    description?: string;
    dynpro_data?: string;
    skip_check?: boolean;
    session_id?: string;
    session_state?: {
        cookies?: string;
        csrf_token?: string;
        cookie_store?: Record<string, string>;
    };
}
export declare function handleCreateScreen(context: HandlerContext, args: CreateScreenArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleCreateScreen.d.ts.map