/**
 * Engine object deployment helpers — create / update-in-place / activate the
 * ABAP engine objects (class ZCL_MCP_CUST_ENGINE, report ZMCP_CUST_WRITE,
 * optional ZCL_MCP_DIAG) using the server's own ADT client tooling.
 *
 * Extracted from the CustomizingEngineBootstrap handler so the autoDeploy path
 * (ensureEngine) shares the same code.
 */
import type { HandlerContext } from '../../handlers/interfaces.js';
export interface DeployOptions {
    package_name?: string;
    transport_request?: string;
}
export interface DeployResult {
    created: boolean;
    activated: boolean;
}
/** Extract the meaningful message from an ADT/Axios error (XML exception text). */
export declare function describeAdtError(err: any): string;
export declare function deployClass(context: HandlerContext, name: string, source: string, opts?: DeployOptions): Promise<DeployResult>;
export declare function deployReport(context: HandlerContext, name: string, source: string, opts?: DeployOptions): Promise<DeployResult>;
//# sourceMappingURL=deployEngine.d.ts.map