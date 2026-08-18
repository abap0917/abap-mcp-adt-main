/**
 * Shared ADT error structuring.
 *
 * SAP's ADT REST API returns errors as `exc:exception` XML:
 *   <exc:exception ...>
 *     <namespace id="com.sap.adt"/>
 *     <type id="ExceptionResourceNotAcceptable"/>
 *     <message lang="EN">The message content is not acceptable...</message>
 *     <localizedMessage lang="ZH">…</localizedMessage>
 *     <properties><entry key="T100KEY-ID">SADT_RESOURCE</entry>…</properties>
 *   </exc:exception>
 *
 * These helpers parse that payload and turn raw Axios errors into readable,
 * structured messages (type + localized text + key hints) instead of dumping
 * raw XML at the caller.
 */
export interface AdtException {
    namespace?: string;
    type?: string;
    message?: string;
    localizedMessage?: string;
    properties: Record<string, string>;
}
/** Parse an ADT `exc:exception` payload from a string; null when not an ADT exception. */
export declare function parseAdtException(xml: string): AdtException | null;
/**
 * Build a readable error message from any error:
 *   - ADT exc:exception → "[<type>] <localizedMessage> (<message>) key=…"
 *   - otherwise → "<message> (HTTP <status>)"
 */
export declare function toErrorMessage(err: any): string;
/**
 * Structured "not found" style message for ADT errors that mean the resource
 * does not exist (404 / 422 with an empty or unknown-resource exception).
 */
export declare function isNotFoundError(err: any): boolean;
//# sourceMappingURL=adtError.d.ts.map