/**
 * OData RFC backend — calls the ZMCP_ADT_SRV OData v2 service on SAP
 * whose FunctionImports `Dispatch` and `Textpool` forward to the
 * RFC-enabled function modules `ZMCP_ADT_DISPATCH` / `ZMCP_ADT_TEXTPOOL`.
 *
 * Best fit for enterprises that disable the legacy `/sap/bc/soap/rfc`
 * ICF node but keep the modern OData Gateway active — the typical
 * shape of a "hardened" SAP Gateway install.
 *
 * Contract-compatible with soapRfc.ts / nativeRfc.ts / gatewayRfc.ts —
 * same DispatchResult / TextpoolResult shapes. Handlers only import
 * from ./rfcBackend, never directly from here.
 *
 * Environment variables (populated from .sc4sap/sap.env):
 *   SAP_RFC_ODATA_SERVICE_URL  — e.g. https://sap.company.com:44300/sap/opu/odata/sap/ZMCP_ADT_SRV
 *   SAP_RFC_ODATA_CSRF_TTL_SEC — CSRF token cache TTL, default 600s
 *   SAP_USERNAME / SAP_PASSWORD / SAP_CLIENT — reused for Basic auth
 *
 * CSRF 2-step handshake on first call (cached TTL = SAP_RFC_ODATA_CSRF_TTL_SEC):
 *   1. GET  {service}/$metadata with header "X-CSRF-Token: Fetch"
 *      → response includes "X-CSRF-Token: <token>" + Set-Cookie(s)
 *   2. POST {service}/Dispatch?IV_ACTION='...'&IV_PARAMS='...'
 *      with header "X-CSRF-Token: <token>" + Cookie: <session>
 *   On HTTP 403 (CSRF expired) → clear cache, retry once.
 *
 * ─────────────────────────────────────────────────────────────────
 * SERVER PREREQUISITE (SEGW MPC_EXT — easy to get wrong):
 * ─────────────────────────────────────────────────────────────────
 * Every Action / FunctionImport in ZCL_ZMCP_ADT_MPC_EXT must call
 * BOTH set_return_complex_type() AND set_return_multiplicity('1'):
 *
 *   lo_action->set_return_complex_type( 'DispatchResult' ).
 *   lo_action->set_return_multiplicity( '1' ).   " ← missing = broken
 *
 * Calling only set_return_complex_type() silently omits the ReturnType
 * attribute from $metadata FunctionImport. Gateway then cannot map the
 * DPC_EXT response and every POST fails with HTTP 500 "In the context
 * of Data Services an unknown internal server error occurred". Easy
 * diagnostic: fetch $metadata and grep for ReturnType="..." on each
 * FunctionImport — if the attribute is missing, this is the cause.
 * (Encountered 2026-04-22.)
 *
 * Do NOT append $format=json to Function Import URLs — Gateway
 * rejects it with "System query options ... are not allowed in the
 * requested URI". Use Accept: application/json header instead.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
import type { DispatchResult, TextpoolResult } from './soapRfc';
interface CsrfSession {
    token: string;
    cookie: string;
    expiresAt: number;
}
/**
 * Call ZMCP_ADT_DISPATCH through the OData `Dispatch` function import.
 * `connection` is accepted for signature parity but ignored — OData URL
 * and SAP credentials come from process.env.
 */
export declare function callDispatch(_connection: IAbapConnection, action: string, params: Record<string, any>): Promise<DispatchResult>;
/**
 * Call ZMCP_ADT_TEXTPOOL through the OData `Textpool` function import.
 */
export declare function callTextpool(_connection: IAbapConnection, action: 'READ' | 'WRITE' | 'WRITE_INACTIVE', params: {
    program: string;
    language?: string;
    textpool_json?: string;
}): Promise<TextpoolResult>;
/**
 * DDIC fallback — ECC-only.
 *
 * ECC 7.40's ADT REST does not expose /sap/bc/adt/ddic/{tables,
 * dataelements, domains} endpoints, so DDIC writes on ECC route through
 * four OData FunctionImports backed by the ZMCP_ADT_DDIC_* function
 * modules: DdicTabl / DdicDtel / DdicDoma (CREATE / UPDATE / DELETE via
 * `iv_action`), and DdicActivate (type + name → DDIF_*_ACTIVATE).
 *
 * Each write FM performs this sequence server-side:
 *   1. RS_CORR_INSERT (creates TADIR + binds to package)
 *   2. DDIF_*_PUT (stages inactive DDIC record)
 *   3. TR_RECORD_OBJ_CHANGE_TO_REQ (appends to transport)
 *   4. WB_TREE_ACTUALIZE (refreshes SE80 repository tree cache)
 *
 * Caller then invokes callDdicActivate separately to activate the
 * staged inactive version. This split matches the S/4HANA ADT pattern
 * (create-then-activate) and lets the caller batch multiple creates
 * before activating.
 *
 * S/4HANA callers must NOT reach these — on S/4 the handlers use the
 * native /sap/bc/adt/ddic/... endpoints directly. The ECC gate lives in
 * each handler, not here.
 */
export interface DdicResult {
    subrc: number;
    message: string;
    result: any;
}
export declare function callDdicTabl(_connection: IAbapConnection, action: 'CREATE' | 'UPDATE' | 'DELETE', params: {
    name: string;
    devclass?: string;
    transport?: string;
    payload_json?: string;
}): Promise<DdicResult>;
export declare function callDdicDtel(_connection: IAbapConnection, action: 'CREATE' | 'UPDATE' | 'DELETE', params: {
    name: string;
    devclass?: string;
    transport?: string;
    payload_json?: string;
}): Promise<DdicResult>;
export declare function callDdicDoma(_connection: IAbapConnection, action: 'CREATE' | 'UPDATE' | 'DELETE', params: {
    name: string;
    devclass?: string;
    transport?: string;
    payload_json?: string;
}): Promise<DdicResult>;
export declare function callDdicActivate(_connection: IAbapConnection, type: 'TABL' | 'DTEL' | 'DOMA', name: string): Promise<DdicResult>;
/**
 * Read-only BAdI implementation discovery — ECC bridge.
 *
 * Calls the ZMCP_ADT_DDIC_BADI function module via the OData
 * FunctionImport `DdicBadi`. Given a (classic) BAdI definition name,
 * returns the implementations registered against it (impl name, impl
 * class, package, methods redefined). Customer-only / active-only
 * filters default to true to match the most common debugging use case
 * ("which Z class extends standard BAdI X?").
 *
 * Result schema (parsed from EV_RESULT JSON):
 *   {
 *     badi_definition: string,
 *     kind: 'classic' | 'unknown',
 *     interface: string,
 *     multi_use: boolean,
 *     filter_dependent: boolean,
 *     implementations: Array<{
 *       impl_name: string,
 *       impl_class: string,
 *       active: boolean,
 *       package: string,
 *       methods_redefined: string[],
 *     }>
 *   }
 *
 * kind='unknown' = def not in SXS_ATTR (likely kernel/new BAdI; not
 * supported in v1). The handler should surface this gracefully.
 */
export declare function callDdicBadi(_connection: IAbapConnection, params: {
    badi_definition: string;
    customer_only?: boolean;
    active_only?: boolean;
    include_methods?: boolean;
}): Promise<DdicResult>;
/**
 * Read-only DDIC table / structure metadata — ECC bridge.
 *
 * Calls ZMCP_ADT_DDIC_TABL_READ via OData FunctionImport `DdicTablRead`.
 * Returns a JSON skeleton compatible with the marketplace `handleGetTable`
 * / `handleGetStructure` handlers when the standard /sap/bc/adt/ddic/tables
 * endpoint is missing on legacy kernels (BASIS < 7.50).
 *
 * Result schema (parsed from EV_RESULT JSON):
 *   {
 *     name: string,
 *     kind: 'TABL' | 'STRU' | string,
 *     tabclass: string,             // TRANSP / STRUCTURE / INTTAB / VIEW / ...
 *     delivery_class: string,
 *     buffered: string,
 *     description: string,
 *     package: string,
 *     fields: Array<{
 *       fieldname: string, position: number, key: boolean, mandatory: boolean,
 *       rollname: string, checktable: string, datatype: string,
 *       leng: number, decimals: number, domname: string, comptype: string,
 *       notnull: boolean, description: string,
 *     }>
 *   }
 */
export declare function callDdicTablRead(_connection: IAbapConnection, params: {
    name: string;
    version?: 'A' | 'I';
}): Promise<DdicResult>;
/**
 * Read-only DDIC data element metadata — ECC bridge.
 *
 * Result schema:
 *   {
 *     name: string, domname: string, datatype: string,
 *     leng: number, decimals: number, outputlen: number,
 *     lowercase: boolean, signflag: boolean, convexit: string,
 *     description: string, heading: string,
 *     short_label: string, medium_label: string, long_label: string,
 *     package: string,
 *   }
 */
export declare function callDdicDtelRead(_connection: IAbapConnection, params: {
    name: string;
    version?: 'A' | 'I';
}): Promise<DdicResult>;
/**
 * Read-only DDIC domain metadata + fixed values — ECC bridge.
 *
 * Result schema:
 *   {
 *     name: string, datatype: string, leng: number, decimals: number,
 *     outputlen: number, lowercase: boolean, signflag: boolean,
 *     convexit: string, value_table: string, description: string,
 *     package: string,
 *     fixed_values: Array<{ valpos: number, low: string, high: string, description: string }>
 *   }
 */
export declare function callDdicDomaRead(_connection: IAbapConnection, params: {
    name: string;
    version?: 'A' | 'I';
}): Promise<DdicResult>;
/**
 * Internal — exposed for tests. Production code should never need to
 * touch the CSRF cache directly.
 */
export declare const __test__: {
    clearCachedSession: () => void;
    getCachedSession: () => CsrfSession | null;
};
export {};
//# sourceMappingURL=odataRfc.d.ts.map