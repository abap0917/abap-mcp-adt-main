/**
 * Native RFC backend — calls RFC-enabled Function Modules via SAP NW RFC SDK.
 *
 * Parallel to soapRfc.ts. Exposes the same public contract
 * (DispatchResult, TextpoolResult) so handlers can swap backends by
 * importing from ./rfcBackend instead of ./soapRfc.
 *
 * Connection parameters come from process.env (populated from .sc4sap/sap.env):
 *   SAP_RFC_ASHOST, SAP_RFC_SYSNR, SAP_RFC_CLIENT,
 *   SAP_RFC_USER,   SAP_RFC_PASSWD, SAP_RFC_LANG,
 *   SAP_RFC_MSHOST, SAP_RFC_SYSID,  SAP_RFC_GROUP,
 *   SAP_RFC_SNC_QOP, SAP_RFC_SNC_MYNAME, SAP_RFC_SNC_PARTNERNAME, SAP_RFC_SNC_LIB
 *
 * Requires: SAP NW RFC SDK 7.50+ installed on the host AND the
 * `node-rfc` optional dependency. If either is missing, the first call
 * throws a descriptive error; MCP boot does not crash because the
 * module is loaded lazily inside `getPool()`.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
import type { DispatchResult, TextpoolResult } from './soapRfc';
/**
 * Call ZMCP_ADT_DISPATCH via native RFC.
 *
 * `connection` is accepted for signature parity with soapRfc.callDispatch
 * but ignored — RFC credentials are sourced from process.env so the
 * pool remains stable across invocations.
 */
export declare function callDispatch(_connection: IAbapConnection, action: string, params: Record<string, any>): Promise<DispatchResult>;
/**
 * Call ZMCP_ADT_TEXTPOOL via native RFC. Same semantics as
 * soapRfc.callTextpool — WRITE fully replaces the language pool,
 * so caller must fetch → modify → write back.
 */
export declare function callTextpool(_connection: IAbapConnection, action: 'READ' | 'WRITE' | 'WRITE_INACTIVE', params: {
    program: string;
    language?: string;
    textpool_json?: string;
}): Promise<TextpoolResult>;
//# sourceMappingURL=nativeRfc.d.ts.map