/**
 * CreateTable Handler - ABAP Table Creation via ADT API
 *
 * Workflow: validate -> create (object in initial state)
 * DDL code is set via UpdateTable handler.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateTable";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP table via the ADT API. Creates the table object in initial state. Use UpdateTable to set DDL code afterwards.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly table_name: {
                readonly type: "string";
                readonly description: "Table name (e.g., ZZ_TEST_TABLE_001). Must follow SAP naming conventions.";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Table description for validation and creation.";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name (e.g., ZOK_LOCAL, $TMP for local objects)";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
        };
        readonly required: readonly ["table_name", "package_name"];
    };
};
interface CreateTableArgs {
    table_name: string;
    description?: string;
    package_name: string;
    transport_request?: string;
}
/**
 * Main handler for CreateTable MCP tool
 */
export declare function handleCreateTable(context: HandlerContext, args: CreateTableArgs): Promise<any>;
export {};
//# sourceMappingURL=handleCreateTable.d.ts.map