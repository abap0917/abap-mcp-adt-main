/**
 * UpdateTable Handler - Update Existing ABAP Table DDL Source
 *
 * Uses TableBuilder from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: lock -> check (new code) -> update (if check OK) -> unlock -> check (inactive version) -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateTable";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Update DDL source code of an existing ABAP table. Locks the table, uploads new DDL source, and unlocks. Optionally activates after update. Use this to modify existing tables without re-creating metadata.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly table_name: {
                readonly type: "string";
                readonly description: "Table name (e.g., ZZ_TEST_TABLE_001). Table must already exist.";
            };
            readonly ddl_code: {
                readonly type: "string";
                readonly description: "Complete DDL source code for a TRANSPARENT TABLE. IMPORTANT — use the MANDT data element for the client key ('key mandt : mandt not null'), NOT 'abap.clnt' (that's CDS-view syntax). Standard SAP tables (MARA, T001, VBAK, …) all use MANDT. The annotation block CreateTable seeded must be preserved verbatim: #NOT_EXTENSIBLE enhancement category, #TRANSPARENT tableCategory, #A deliveryClass, #RESTRICTED dataMaintenance. Example: '@EndUserText.label : \\'My Table\\' @AbapCatalog.enhancement.category : #NOT_EXTENSIBLE @AbapCatalog.tableCategory : #TRANSPARENT @AbapCatalog.deliveryClass : #A @AbapCatalog.dataMaintenance : #RESTRICTED define table ztst_table { key mandt : mandt not null; key id : abap.char(10); name : abap.char(255); }'";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Optional if object is local or already in transport.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate table after source update. Default: true.";
            };
        };
        readonly required: readonly ["table_name", "ddl_code"];
    };
};
interface UpdateTableArgs {
    table_name: string;
    ddl_code: string;
    transport_request?: string;
    activate?: boolean;
}
/**
 * Main handler for UpdateTable MCP tool
 *
 * Uses TableBuilder from @babamba2/mcp-abap-adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export declare function handleUpdateTable(context: HandlerContext, args: UpdateTableArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateTable.d.ts.map