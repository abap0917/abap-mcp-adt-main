/**
 * RFC backend selector.
 *
 * Reads SAP_RFC_BACKEND from process.env ('odata' default, 'soap' /
 * 'native' / 'gateway' opt-in) and re-exports the matching
 * callDispatch / callTextpool implementation.
 *
 * Default changed 2026-04-22 from 'soap' to 'odata': hardened Gateway
 * installs increasingly disable the /sap/bc/soap/rfc ICF node, and the
 * OData path goes through standard Gateway authorization (S_SERVICE)
 * instead of S_RFC. Existing setups that explicitly set
 * SAP_RFC_BACKEND=soap are unaffected.
 *
 *   soap    — classic /sap/bc/soap/rfc HTTPS gateway (SAP built-in)
 *   native  — direct NW RFC SDK on this host (requires SDK + node-rfc)
 *   gateway — remote RFC Gateway middleware via HTTPS/JSON (no SDK here)
 *   odata   — SAP OData v2 service (ZMCP_ADT_SRV) via HTTPS (SEGW-free)
 *
 * Handlers import from this file, never directly from soapRfc.ts /
 * nativeRfc.ts / gatewayRfc.ts / odataRfc.ts, so switching backends is
 * a single env flip with no code change. The resolution happens once
 * at module-load time — changing SAP_RFC_BACKEND at runtime requires
 * an MCP server restart, which is already required for any sap.env
 * edit.
 */
import * as native from './nativeRfc';
import * as odata from './odataRfc';
export type RfcBackend = 'soap' | 'native' | 'gateway' | 'odata';
export declare const backend: RfcBackend;
export declare const callDispatch: typeof native.callDispatch;
export declare const callTextpool: typeof native.callTextpool;
export declare const callDdicTabl: typeof odata.callDdicTabl;
export declare const callDdicDtel: typeof odata.callDdicDtel;
export declare const callDdicDoma: typeof odata.callDdicDoma;
export declare const callDdicActivate: typeof odata.callDdicActivate;
export declare const callDdicBadi: typeof odata.callDdicBadi;
export declare const callDdicTablRead: typeof odata.callDdicTablRead;
export declare const callDdicDtelRead: typeof odata.callDdicDtelRead;
export declare const callDdicDomaRead: typeof odata.callDdicDomaRead;
export type { DdicResult } from './odataRfc';
export type { DispatchResult, TextpoolResult, TextpoolRow } from './soapRfc';
//# sourceMappingURL=rfcBackend.d.ts.map