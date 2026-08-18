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

export const ACCEPT_DATA_ELEMENT =
  'application/vnd.sap.adt.dataelements.v2+xml, application/vnd.sap.adt.dataelements.v1+xml';
export const CT_DATA_ELEMENT_UPDATE =
  'application/vnd.sap.adt.dataelements.v2+xml; charset=utf-8';

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Set an attribute on the ROOT element's opening tag only (add if missing).
 */
export function patchRootAttribute(
  xml: string,
  attrName: string,
  newValue: string,
): string {
  const rootOpenMatch = xml.match(/<[a-zA-Z0-9:_-]+\b[^>]*>/);
  if (!rootOpenMatch) return xml;
  const rootOpen = rootOpenMatch[0];
  const attrRe = new RegExp(`${attrName}="[^"]*"`);
  if (attrRe.test(rootOpen)) {
    const updated = rootOpen.replace(
      attrRe,
      `${attrName}="${escapeXmlAttr(newValue)}"`,
    );
    return xml.replace(rootOpen, updated);
  }
  // Insert before the closing '>' of the root opening tag.
  const insertPos = rootOpen.length - 1;
  const updated =
    rootOpen.slice(0, insertPos) +
    ` ${attrName}="${escapeXmlAttr(newValue)}"` +
    rootOpen.slice(insertPos);
  return xml.replace(rootOpen, updated);
}

/**
 * Replace an element's text content (handles `<tag>..</tag>` and `<tag/>`).
 */
export function patchElement(
  xml: string,
  tagName: string,
  newValue: string,
): string {
  const regex = new RegExp(
    `<${tagName}>([^<]*)</${tagName}>|<${tagName}\\s*/>`,
  );
  if (newValue === '' || newValue === undefined) {
    return xml.replace(regex, `<${tagName}/>`);
  }
  return xml.replace(
    regex,
    `<${tagName}>${escapeXmlText(newValue)}</${tagName}>`,
  );
}

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
export async function updateDataElementXml(
  connection: IAbapConnection,
  args: DataElementUpdateArgs,
  lockHandle: string,
): Promise<unknown> {
  const name = args.dataElementName.toUpperCase();
  const dtelUri = `/sap/bc/adt/ddic/dataelements/${name.toLowerCase()}`;

  const currentResp = await connection.makeAdtRequest({
    url: dtelUri,
    method: 'GET',
    timeout: 30_000,
    headers: { Accept: ACCEPT_DATA_ELEMENT },
  });
  let xml =
    typeof currentResp.data === 'string'
      ? currentResp.data
      : JSON.stringify(currentResp.data ?? '');

  const descText = args.description || name;
  xml = patchRootAttribute(xml, 'adtcore:description', descText);

  const typeKind = args.typeKind;
  xml = patchElement(xml, 'dtel:typeKind', typeKind);
  const typeNameVal =
    typeKind === 'domain'
      ? (args.typeName || args.dataType || '').toUpperCase()
      : (args.typeName || '').toUpperCase();
  if (typeNameVal) xml = patchElement(xml, 'dtel:typeName', typeNameVal);
  xml = patchElement(xml, 'dtel:dataType', args.dataType || 'CHAR');
  xml = patchElement(
    xml,
    'dtel:dataTypeLength',
    String(args.length || 100).padStart(6, '0'),
  );
  xml = patchElement(
    xml,
    'dtel:dataTypeDecimals',
    String(args.decimals || 0).padStart(6, '0'),
  );
  if (args.shortLabel !== undefined)
    xml = patchElement(xml, 'dtel:shortFieldLabel', args.shortLabel);
  if (args.mediumLabel !== undefined)
    xml = patchElement(xml, 'dtel:mediumFieldLabel', args.mediumLabel);
  if (args.longLabel !== undefined)
    xml = patchElement(xml, 'dtel:longFieldLabel', args.longLabel);
  if (args.headingLabel !== undefined)
    xml = patchElement(xml, 'dtel:headingFieldLabel', args.headingLabel);
  if (args.searchHelp !== undefined)
    xml = patchElement(xml, 'dtel:searchHelp', args.searchHelp);
  if (args.searchHelpParameter !== undefined)
    xml = patchElement(
      xml,
      'dtel:searchHelpParameter',
      args.searchHelpParameter,
    );
  if (args.setGetParameter !== undefined)
    xml = patchElement(xml, 'dtel:setGetParameter', args.setGetParameter);

  const corrNrParam = args.transportRequest
    ? `&corrNr=${encodeURIComponent(args.transportRequest)}`
    : '';
  const url = `${dtelUri}?lockHandle=${encodeURIComponent(lockHandle)}${corrNrParam}`;

  return connection.makeAdtRequest({
    url,
    method: 'PUT',
    timeout: 120_000,
    data: xml,
    headers: {
      Accept: ACCEPT_DATA_ELEMENT,
      'Content-Type': CT_DATA_ELEMENT_UPDATE,
    },
  });
}
