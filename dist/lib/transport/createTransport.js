"use strict";
/**
 * Transport request creation with corrected target handling.
 *
 * The client lib (`@babamba2/mcp-abap-adt-clients` core/transport/create.js)
 * wraps the target system in `/.../` (`tm:target="/VSD/"`), which the CTS
 * endpoint rejects / misinterprets — the ADT protocol expects the raw target
 * name (e.g. "VSD"). This module builds the request XML itself via
 * `connection.makeAdtRequest` with the raw target, and auto-discovers the
 * system's transport target(s) from E070 when the caller doesn't provide one.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeTarget = sanitizeTarget;
exports.discoverTransportTargets = discoverTransportTargets;
exports.createTransportRequest = createTransportRequest;
const runSql_1 = require("../customizing/runSql");
const ACCEPT_TRANSPORT = 'application/vnd.sap.adt.transportorganizer.v1+xml';
const TRANSPORT_URL = '/sap/bc/adt/cts/transportrequests';
/** Normalize a TARSYSTEM value: trim and strip surrounding slashes ("/VSD/" → "VSD"). */
function sanitizeTarget(t) {
    return t.trim().replace(/^\/+|\/+$/g, '');
}
/**
 * Discover transport targets this system uses, from E070.
 * Strategy:
 *   1. GROUP BY TARSYSTEM → full distinct set + usage frequency
 *      (plain SELECT caps at the Data Preview row limit and missed targets).
 *   2. Default target = the most frequently used target, excluding 'SAP'
 *      (the system-internal target for SAP requests, not a user dev target).
 */
async function discoverTransportTargets(connection, logger) {
    const targets = [];
    const freq = {};
    try {
        const rows = await (0, runSql_1.runSql)(connection, logger, `SELECT TARSYSTEM, COUNT(*) AS CNT FROM E070 WHERE TARSYSTEM <> '' GROUP BY TARSYSTEM`, 500);
        for (const r of rows) {
            const t = sanitizeTarget((0, runSql_1.col)(r, 'TARSYSTEM'));
            if (!t)
                continue;
            if (!targets.includes(t))
                targets.push(t);
            freq[t] = (freq[t] ?? 0) + (parseInt((0, runSql_1.col)(r, 'CNT'), 10) || 1);
        }
    }
    catch {
        // GROUP BY unsupported → fall back to DISTINCT (may be capped by row limit).
        try {
            const rows2 = await (0, runSql_1.runSql)(connection, logger, `SELECT DISTINCT TARSYSTEM FROM E070`, 500);
            for (const r of rows2) {
                const t = sanitizeTarget((0, runSql_1.col)(r, 'TARSYSTEM'));
                if (t && !targets.includes(t))
                    targets.push(t);
            }
        }
        catch {
            /* E070 not query-accessible — degrade to empty */
        }
    }
    targets.sort();
    const candidates = targets.filter((t) => t.toUpperCase() !== 'SAP');
    const defaultTarget = candidates.length
        ? [...candidates].sort((a, b) => (freq[b] ?? 0) - (freq[a] ?? 0))[0]
        : null;
    return { targets, defaultTarget };
}
/** Build the CTS create-request XML with a RAW target (no slashes). */
function buildCreateTransportXml(opts, owner) {
    const transportType = opts.transportType === 'customizing' ? 'T' : 'K';
    const description = opts.description || 'Transport request created via MCP';
    const target = opts.targetSystem?.trim() || 'LOCAL';
    return `<?xml version="1.0" encoding="ASCII"?>
<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="newrequest">
  <tm:request tm:desc="${escapeXml(description)}" tm:type="${transportType}" tm:target="${escapeXml(target)}" tm:cts_project="">
    <tm:task tm:owner="${escapeXml(owner)}"/>
  </tm:request>
</tm:root>`;
}
function escapeXml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/** Parse the tm:root create response. */
function parseTransportResponse(xml) {
    const attr = (tag, name) => {
        const re = new RegExp(`<[a-zA-Z0-9_:]*${tag}[^>]*\\b${name}="([^"]*)"`);
        const m = xml.match(re);
        return m ? m[1] : undefined;
    };
    return {
        transport_number: attr('request', 'number'),
        description: attr('request', 'desc') ?? attr('request', 'description'),
        type: attr('request', 'type'),
        target_system: attr('request', 'target'),
        target_desc: attr('request', 'target_desc'),
        cts_project: attr('request', 'cts_project'),
        uri: attr('request', 'uri'),
    };
}
/** Create a transport request with a raw target (fixes the client lib's /…/ bug). */
async function createTransportRequest(connection, logger, opts, owner) {
    const xml = buildCreateTransportXml(opts, owner);
    const resp = await connection.makeAdtRequest({
        url: TRANSPORT_URL,
        method: 'POST',
        timeout: 60_000,
        data: xml,
        headers: { Accept: ACCEPT_TRANSPORT, 'Content-Type': 'text/plain' },
    });
    const body = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
    const parsed = parseTransportResponse(body);
    return {
        transport_number: parsed.transport_number ?? '',
        description: parsed.description ?? opts.description,
        type: parsed.type ?? (opts.transportType === 'customizing' ? 'T' : 'K'),
        target_system: parsed.target_system ?? opts.targetSystem?.trim() ?? 'LOCAL',
        target_desc: parsed.target_desc,
        cts_project: parsed.cts_project,
        owner,
        uri: parsed.uri,
    };
}
//# sourceMappingURL=createTransport.js.map