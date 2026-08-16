/**
 * In-system engine ICF client — JSON protocol between the MCP server and the
 * ABAP handlers deployed at /sap/bc/zmcp_cust (customizing engine) and
 * /sap/bc/zmcp_diag (read-only diagnostic engine).
 *
 * Ported from abap-config-mcp. Request JSON uses lowercase keys (ABAP
 * /ui2/cl_json deserialises case-insensitively); the response uses UPPERCASE
 * keys (serialised by /ui2/cl_json with pretty_mode none).
 */
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
export interface EngineResponse {
    STATUS: string;
    OPERATION?: string;
    VERSION?: string;
    DRY_RUN?: string;
    TABLE?: string;
    ROWS_PLANNED?: number;
    ROWS_WRITTEN?: number;
    TRANSPORT?: string;
    MESSAGES?: string[];
    DATA_JSON?: string;
    RUN_ID?: string;
}
/** POST a JSON request to the customizing engine (writes / IMG index reads). */
export declare function callEngine(connection: IAbapConnection, logger: ILogger | undefined, operation: string, req?: Record<string, unknown>, timeoutMs?: number): Promise<EngineResponse>;
/** POST a JSON request to the Tier-0 diagnostic engine. */
export declare function callDiag(connection: IAbapConnection, logger: ILogger | undefined, operation: string, req?: Record<string, unknown>, timeoutMs?: number): Promise<EngineResponse>;
//# sourceMappingURL=engineClient.d.ts.map