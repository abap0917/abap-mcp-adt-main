/**
 * CreateStructure Handler - ABAP Structure Creation via ADT API
 *
 * Uses StructureBuilder from @babamba2/mcp-abap-adt-clients for all operations.
 * Session and lock management handled internally by builder.
 *
 * Workflow: validate -> create -> lock -> check (inactive version) -> unlock -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateStructure";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP structure in SAP system with fields and type references. Includes create, activate, and verify steps.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly structure_name: {
                readonly type: "string";
                readonly description: "Structure name (e.g., ZZ_S_TEST_001). Must follow SAP naming conventions.";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Structure description. If not provided, structure_name will be used.";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name (e.g., ZOK_LOCAL, $TMP for local objects)";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (e.g., E19K905635). Required for transportable packages.";
            };
            readonly fields: {
                readonly type: "array";
                readonly description: "Array of structure fields";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                            readonly description: "Field name (e.g., CLIENT, MATERIAL_ID)";
                        };
                        readonly data_type: {
                            readonly type: "string";
                            readonly description: "Data type: CHAR, NUMC, DATS, TIMS, DEC, INT1, INT2, INT4, INT8, CURR, QUAN, etc.";
                        };
                        readonly length: {
                            readonly type: "number";
                            readonly description: "Field length";
                        };
                        readonly decimals: {
                            readonly type: "number";
                            readonly description: "Decimal places (for DEC, CURR, QUAN types)";
                            readonly default: 0;
                        };
                        readonly domain: {
                            readonly type: "string";
                            readonly description: "Domain name for type reference (optional)";
                        };
                        readonly data_element: {
                            readonly type: "string";
                            readonly description: "Data element name for type reference (optional)";
                        };
                        readonly structure_ref: {
                            readonly type: "string";
                            readonly description: "Include another structure (optional)";
                        };
                        readonly table_ref: {
                            readonly type: "string";
                            readonly description: "Reference to table type (optional)";
                        };
                        readonly description: {
                            readonly type: "string";
                            readonly description: "Field description";
                        };
                    };
                    readonly required: readonly ["name"];
                };
            };
            readonly includes: {
                readonly type: "array";
                readonly description: "Include other structures in this structure";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                            readonly description: "Include structure name";
                        };
                        readonly suffix: {
                            readonly type: "string";
                            readonly description: "Optional suffix for include fields";
                        };
                    };
                    readonly required: readonly ["name"];
                };
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate structure after creation. Default: true. Set to false for batch operations (activate multiple objects later).";
            };
        };
        readonly required: readonly ["structure_name", "package_name", "fields"];
    };
};
interface StructureField {
    name: string;
    data_type?: string;
    length?: number;
    decimals?: number;
    domain?: string;
    data_element?: string;
    structure_ref?: string;
    table_ref?: string;
    description?: string;
}
interface StructureInclude {
    name: string;
    suffix?: string;
}
interface CreateStructureArgs {
    structure_name: string;
    description?: string;
    package_name: string;
    transport_request?: string;
    fields: StructureField[];
    includes?: StructureInclude[];
    activate?: boolean;
}
/**
 * Main handler for CreateStructure MCP tool
 *
 * Uses StructureBuilder from @babamba2/mcp-abap-adt-clients for all operations
 * Session and lock management handled internally by builder
 */
export declare function handleCreateStructure(context: HandlerContext, args: CreateStructureArgs): Promise<any>;
export {};
//# sourceMappingURL=handleCreateStructure.d.ts.map