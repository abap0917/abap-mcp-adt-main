/**
 * CreateView Handler - CDS/Classic View Creation via ADT API
 *
 * Workflow: validate -> create (object in initial state)
 * DDL source is set via UpdateView handler.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateView";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "Create CDS View or Classic View in SAP. Creates the view object in initial state. Use UpdateView to set DDL source code afterwards.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly view_name: {
                readonly type: "string";
                readonly description: "View name (e.g., ZOK_R_TEST_0002, Z_I_MY_VIEW).";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name (e.g., ZOK_LAB, $TMP for local objects)";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (required for transportable packages).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Optional description (defaults to view_name).";
            };
        };
        readonly required: readonly ["view_name", "package_name"];
    };
};
export declare function handleCreateView(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateView.d.ts.map