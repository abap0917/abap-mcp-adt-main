/**
 * ZRFC backend — calls custom ICF handler `ZCL_MCP_RFC_HTTP_HANDLER`
 * mounted at `/sap/bc/rest/zmcp_rfc` on the SAP system.
 *
 * The ABAP handler exposes `ZMCP_ADT_DISPATCH` / `ZMCP_ADT_TEXTPOOL`
 * as HTTPS/JSON endpoints, so this backend needs neither the SAP NW
 * RFC SDK (unlike `native`/`gateway`) nor the SOAP RFC ICF node
 * (unlike `soap`) nor OData Gateway registration (unlike `odata`).
 *
 * Best fit for ECC / hardened S/4 systems where `/sap/bc/soap/rfc` is
 * closed by policy and OData Gateway is not configured. Single Basis
 * action required: activate one ICF node + install one handler class.
 *
 * Contract-compatible with soapRfc.ts / nativeRfc.ts / gatewayRfc.ts /
 * odataRfc.ts — same DispatchResult / TextpoolResult shapes. Handlers
 * only import from ./rfcBackend, never directly from here.
 *
 * Environment variables (populated from .sc4sap/sap.env):
 *   SAP_RFC_ZRFC_BASE_URL    — e.g. https://sap.company.com:44300/sap/bc/rest/zmcp_rfc  (required)
 *   SAP_RFC_ZRFC_CSRF_TTL_SEC — CSRF token cache TTL, default 600s
 *   SAP_USERNAME / SAP_PASSWORD / SAP_CLIENT — reused for Basic auth
 *
 * CSRF handshake (double-submit cookie, mirrors odataRfc.ts):
 *   1. GET  {base}/dispatch with "X-CSRF-Token: Fetch"
 *      → 200 + response "X-CSRF-Token: <uuid>" + Set-Cookie "zrfc_csrf=<uuid>"
 *   2. POST {base}/<endpoint> with "X-CSRF-Token: <uuid>" + Cookie "zrfc_csrf=<uuid>"
 *      On HTTP 403 (CSRF expired) → clear cache, retry once.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
import type { DispatchResult, TextpoolResult } from './soapRfc';
interface CsrfSession {
    token: string;
    cookie: string;
    expiresAt: number;
}
/**
 * Call ZMCP_ADT_DISPATCH via the zrfc ICF handler.
 * `connection` is accepted for signature parity but ignored — the URL
 * and SAP credentials come from process.env.
 */
export declare function callDispatch(_connection: IAbapConnection, action: string, params: Record<string, any>): Promise<DispatchResult>;
/**
 * Call ZMCP_ADT_TEXTPOOL via the zrfc ICF handler.
 */
export declare function callTextpool(_connection: IAbapConnection, action: 'READ' | 'WRITE' | 'WRITE_INACTIVE', params: {
    program: string;
    language?: string;
    textpool_json?: string;
}): Promise<TextpoolResult>;
/**
 * Internal — exposed for tests. Production code should never need to
 * touch the CSRF cache directly.
 */
export declare const __test__: {
    clearCachedSession: () => void;
    getCachedSession: () => CsrfSession | null;
};
export {};
//# sourceMappingURL=zrfcProxy.d.ts.map