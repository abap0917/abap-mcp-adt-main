/**
 * CreateServiceDefinition Handler - ABAP Service Definition Creation via ADT API
 *
 * Uses AdtClient from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by client.
 *
 * Workflow: validate -> create -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateServiceDefinition";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP service definition for OData services. Service definitions define the structure and behavior of OData services. Uses stateful session for proper lock management.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly service_definition_name: {
                readonly type: "string";
                readonly description: "Service definition name (e.g., ZSD_MY_SERVICE). Must follow SAP naming conventions (start with Z or Y).";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Service definition description. If not provided, service_definition_name will be used.";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name (e.g., ZOK_LOCAL, $TMP for local objects)";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Service definition source code (optional). If not provided, a minimal template will be created.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate service definition after creation. Default: true.";
            };
        };
        readonly required: readonly ["service_definition_name", "package_name"];
    };
};
interface CreateServiceDefinitionArgs {
    service_definition_name: string;
    description?: string;
    package_name: string;
    transport_request?: string;
    source_code?: string;
    activate?: boolean;
}
/**
 * Main handler for CreateServiceDefinition MCP tool
 *
 * Uses AdtClient.createServiceDefinition
 */
export declare function handleCreateServiceDefinition(context: HandlerContext, args: CreateServiceDefinitionArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleCreateServiceDefinition.d.ts.map