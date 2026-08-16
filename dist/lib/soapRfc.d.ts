/**
 * SOAP RFC Utility - Call RFC-enabled Function Modules via SAP SOAP endpoint
 *
 * Uses /sap/bc/soap/rfc to call RFC FMs with simple string parameters.
 * Designed for the ZMCP_ADT_DISPATCH dispatcher FM which uses JSON strings.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
export interface SoapRfcResult {
    /** Raw parsed SOAP response parameters */
    raw: Record<string, any>;
}
export interface DispatchResult {
    /** JSON-parsed result from EV_RESULT */
    result: any;
    /** ABAP SY-SUBRC equivalent */
    subrc: number;
    /** Error/info message from ABAP */
    message: string;
}
export interface TextpoolRow {
    ID: 'I' | 'S' | 'R' | 'H' | string;
    KEY: string;
    ENTRY: string;
    LENGTH: number;
}
export interface TextpoolResult {
    /** JSON-parsed result from EV_RESULT (array of rows for READ, {written:true} for WRITE) */
    result: any;
    subrc: number;
    message: string;
}
/**
 * Call an RFC-enabled Function Module via SOAP
 *
 * @param connection SAP connection
 * @param fmName Function module name (must be RFC-enabled)
 * @param params Key-value pairs for IMPORTING parameters (string values)
 * @returns Parsed SOAP response parameters
 */
export declare function callSoapRfc(connection: IAbapConnection, fmName: string, params: Record<string, string>): Promise<SoapRfcResult>;
/**
 * Call ZMCP_ADT_DISPATCH via SOAP RFC - the JSON dispatcher FM
 *
 * @param connection SAP connection
 * @param action Action name (e.g., 'CUA_FETCH', 'DYNPRO_READ')
 * @param params JSON-serializable parameters for the action
 * @returns Parsed dispatch result with JSON result, subrc, and message
 */
export declare function callDispatch(connection: IAbapConnection, action: string, params: Record<string, any>): Promise<DispatchResult>;
/**
 * Call ZMCP_ADT_TEXTPOOL via SOAP RFC - dedicated text pool read/write FM.
 *
 * Text elements (text symbols, selection texts, program title, list
 * headings) have no ADT URI, so this routes through a custom RFC in
 * function group ZMCP_ADT_UTILS. INSERT TEXTPOOL fully replaces the
 * language-specific pool, so WRITE must always carry the complete
 * array (fetch → modify → write back). The FM writes with STATE 'A'
 * so the text pool becomes active in one round-trip (matching the
 * CUA/DYNPRO dispatcher semantics).
 *
 * @param action 'READ' | 'WRITE' | 'WRITE_INACTIVE' — WRITE_INACTIVE stages
 *   the whole pool with STATE 'I' so the parent program's activation
 *   promotes the pool atomically. Use it when registering many elements
 *   on a not-yet-activated program.
 * @param params program/language/textpool_json
 */
export declare function callTextpool(connection: IAbapConnection, action: 'READ' | 'WRITE' | 'WRITE_INACTIVE', params: {
    program: string;
    language?: string;
    textpool_json?: string;
}): Promise<TextpoolResult>;
//# sourceMappingURL=soapRfc.d.ts.map