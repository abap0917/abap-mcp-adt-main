/**
 * UpdateView Handler - Update existing CDS/Classic view DDL source
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive) -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateView";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "Update DDL source code of an existing CDS View or Classic View. Locks the view, checks new code, uploads new DDL source, unlocks, and optionally activates.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly view_name: {
                readonly type: "string";
                readonly description: "View name (e.g., ZOK_R_TEST_0002).";
            };
            readonly ddl_source: {
                readonly type: "string";
                readonly description: "Complete DDL source code.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: false.";
            };
        };
        readonly required: readonly ["view_name", "ddl_source"];
    };
};
export declare function handleUpdateView(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateView.d.ts.map