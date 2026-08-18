/**
 * Data-element read-modify-write update helper.
 *
 * The client library's `patchXmlAttribute` replaces the FIRST match of an
 * attribute anywhere in the XML. On systems where the data-element metadata
 * GET returns `adtcore:description` on the packageRef (and NOT on the root
 * `blue:wbobj`), that patch silently rewrites the packageRef's description
 * and leaves the root element without one — the PUT then fails with
 * "缺少描述" / "条件检查失败" (scr_prop_no_decr).
 *
 * This helper re-implements the read-modify-write with root-targeted
 * attribute handling: GET current XML → patch the ROOT element's attributes
 * (adding them if missing) → patch dtel elements → PUT with the lockHandle.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
export declare const ACCEPT_DATA_ELEMENT = "application/vnd.sap.adt.dataelements.v2+xml, application/vnd.sap.adt.dataelements.v1+xml";
export declare const CT_DATA_ELEMENT_UPDATE = "application/vnd.sap.adt.dataelements.v2+xml; charset=utf-8";
/**
 * Set an attribute on the ROOT element's opening tag only (add if missing).
 */
export declare function patchRootAttribute(xml: string, attrName: string, newValue: string): string;
/**
 * Replace an element's text content (handles `<tag>..</tag>` and `<tag/>`).
 */
export declare function patchElement(xml: string, tagName: string, newValue: string): string;
export interface DataElementUpdateArgs {
    dataElementName: string;
    description?: string;
    dataType?: string;
    length?: number;
    decimals?: number;
    shortLabel?: string;
    mediumLabel?: string;
    longLabel?: string;
    headingLabel?: string;
    typeKind: string;
    typeName?: string;
    searchHelp?: string;
    searchHelpParameter?: string;
    setGetParameter?: string;
    transportRequest?: string;
}
/**
 * GET current data-element XML, patch it, PUT it back under the caller's
 * lock. Returns the PUT response.
 */
export declare function updateDataElementXml(connection: IAbapConnection, args: DataElementUpdateArgs, lockHandle: string): Promise<unknown>;
//# sourceMappingURL=ddicDataElementUpdate.d.ts.map