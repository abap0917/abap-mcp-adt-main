"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAdtException = parseAdtException;
exports.toErrorMessage = toErrorMessage;
exports.isNotFoundError = isNotFoundError;
/** Parse an ADT `exc:exception` payload from a string; null when not an ADT exception. */
function parseAdtException(xml) {
    if (!/<[a-zA-Z0-9_]*:?exception[^>]*>/i.test(xml))
        return null;
    const type = xml.match(/<[a-zA-Z0-9_]*:?type\b[^>]*id="([^"]+)"/)?.[1] ??
        xml.match(/<[a-zA-Z0-9_]*:?type[^>]*>([^<]+)</)?.[1];
    const namespace = xml.match(/<[a-zA-Z0-9_]*:?namespace\b[^>]*id="([^"]+)"/)?.[1];
    const message = xml.match(/<[a-zA-Z0-9_]*:?message\b[^>]*>([^<]+)</)?.[1] ?? '';
    const localizedMessage = xml.match(/<[a-zA-Z0-9_]*:?localizedMessage\b[^>]*>([^<]+)</)?.[1] ?? '';
    const properties = {};
    for (const m of xml.matchAll(/<entry key="([^"]+)">([^<]*)<\/entry>/g)) {
        properties[m[1]] = m[2];
    }
    return {
        namespace,
        type,
        message: message || undefined,
        localizedMessage: localizedMessage || undefined,
        properties,
    };
}
/** Extract the response payload string from any error object. */
function responseBody(err) {
    const data = err?.response?.data ?? err?.data;
    if (data == null)
        return undefined;
    if (typeof data === 'string')
        return data;
    try {
        return JSON.stringify(data);
    }
    catch {
        return String(data);
    }
}
/**
 * Build a readable error message from any error:
 *   - ADT exc:exception → "[<type>] <localizedMessage> (<message>) key=…"
 *   - otherwise → "<message> (HTTP <status>)"
 */
function toErrorMessage(err) {
    const status = err?.response?.status ?? err?.status;
    const body = responseBody(err);
    if (body) {
        const exc = parseAdtException(body);
        if (exc) {
            const parts = [];
            if (exc.type)
                parts.push(`[${exc.type}]`);
            const text = exc.localizedMessage || exc.message;
            if (text)
                parts.push(text);
            if (exc.localizedMessage &&
                exc.message &&
                exc.localizedMessage !== exc.message) {
                parts.push(`(${exc.message})`);
            }
            const keys = Object.entries(exc.properties)
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}=${v}`);
            if (keys.length)
                parts.push(keys.join(', '));
            if (status)
                parts.push(`HTTP ${status}`);
            return parts.join(' — ');
        }
        // Non-ADT body: strip to a readable excerpt.
        const cleaned = body.replace(/\s+/g, ' ').trim();
        if (cleaned) {
            return status
                ? `${cleaned.slice(0, 500)} (HTTP ${status})`
                : cleaned.slice(0, 500);
        }
    }
    const msg = err?.message ?? String(err);
    return status ? `${msg} (HTTP ${status})` : msg;
}
/**
 * Structured "not found" style message for ADT errors that mean the resource
 * does not exist (404 / 422 with an empty or unknown-resource exception).
 */
function isNotFoundError(err) {
    const status = err?.response?.status ?? err?.status;
    if (status === 404)
        return true;
    const body = responseBody(err);
    if (!body)
        return status === 422;
    const exc = parseAdtException(body);
    if (!exc)
        return status === 422;
    const t = (exc.type ?? '').toLowerCase();
    return (t.includes('notfound') ||
        t.includes('not_found') ||
        t.includes('unknownobject') ||
        t.includes('unknownresource') ||
        (t.includes('exceptionresourcealreadyexists') === false &&
            status === 422 &&
            !exc.message));
}
//# sourceMappingURL=adtError.js.map