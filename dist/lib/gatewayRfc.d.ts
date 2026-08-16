/**
 * Gateway RFC backend — calls a remote HTTPS middleware that owns the
 * NW RFC SDK + node-rfc stack on behalf of many MCP clients.
 *
 * Architecture:
 *   MCP client ──HTTPS/JSON──▶ RFC Gateway (Node + node-rfc) ──RFC──▶ SAP
 *
 * This backend keeps developer laptops free of the NW RFC SDK / MSVC
 * build tools / S-user downloads. All of that lives on the gateway.
 *
 * Contract-compatible with soapRfc.ts and nativeRfc.ts — same
 * DispatchResult / TextpoolResult shapes. Handlers only import from
 * ./rfcBackend, never directly from here.
 *
 * Environment variables (populated from .sc4sap/sap.env):
 *   SAP_RFC_GATEWAY_URL       — e.g. https://rfc-gw.company.com:8443  (required)
 *   SAP_RFC_GATEWAY_TOKEN     — Bearer token for gateway ACL          (optional but recommended)
 *   SAP_RFC_GATEWAY_TLS_VERIFY — "0" to allow self-signed certs        (optional, default "1")
 *
 * SAP credentials are forwarded per-request via X-SAP-* headers using
 * the same SAP_USERNAME / SAP_PASSWORD / SAP_CLIENT values the ADT
 * HTTPS backend already consumes. Each developer therefore stays
 * identified on the SAP side (audit trail preserved).
 *
 * Gateway contract:
 *   POST /rfc/dispatch   body { action, params }           → { result, subrc, message }
 *   POST /rfc/textpool   body { action, program, language,
 *                                textpool_json }           → { result, subrc, message }
 *   GET  /health                                           → { status: "ok", ... }
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
import type { DispatchResult, TextpoolResult } from './soapRfc';
/**
 * Call ZMCP_ADT_DISPATCH via the gateway. `connection` is accepted for
 * signature parity but ignored — the gateway URL and SAP creds come
 * from process.env.
 */
export declare function callDispatch(_connection: IAbapConnection, action: string, params: Record<string, any>): Promise<DispatchResult>;
/**
 * Call ZMCP_ADT_TEXTPOOL via the gateway.
 */
export declare function callTextpool(_connection: IAbapConnection, action: 'READ' | 'WRITE' | 'WRITE_INACTIVE', params: {
    program: string;
    language?: string;
    textpool_json?: string;
}): Promise<TextpoolResult>;
//# sourceMappingURL=gatewayRfc.d.ts.map