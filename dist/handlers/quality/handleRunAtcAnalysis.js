"use strict";
/**
 * RunAtcAnalysis — ATC (ABAP Test Cockpit) findings tool.
 *
 * Three modes:
 *   1. `object_url`  — create a new ATC run for an object and return findings
 *      (POST /sap/bc/adt/atc/runs?worklistId=<variant> → GET worklists/<runId>).
 *   2. `run_id`      — fetch the worklist of an existing ATC run by its
 *      worklist ID (GET /sap/bc/adt/atc/worklists/<runId>).
 *   3. `display_id`  — fetch a saved ATC result by its display ID
 *      (GET /sap/bc/adt/atc/results/<displayId>, Accept: application/xml).
 *      Display IDs are the ones returned by the ATC results list (e.g. the
 *      "ATC Results" view / /sap/bc/adt/atc/results feed).
 *
 * Ported from abap-config-mcp (abap-adt-api atc.ts).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleRunAtcAnalysis = handleRunAtcAnalysis;
const utils_js_1 = require("../../lib/utils.js");
exports.TOOL_DEFINITION = {
    name: 'RunAtcAnalysis',
    available_in: ['onprem', 'cloud'],
    description: '[quality] ATC (ABAP Test Cockpit) findings. Provide object_url to run a new check, run_id to fetch an existing run worklist by its worklist ID, or display_id to fetch a saved ATC result by display ID. Returns priority, check, message, location.',
    inputSchema: {
        type: 'object',
        properties: {
            object_url: {
                type: 'string',
                description: 'ADT object URL to check, e.g. /sap/bc/adt/oo/classes/zcl_my_class (or programs/…/source/main for a report).',
            },
            run_id: {
                type: 'string',
                description: 'Existing ATC run worklist ID to fetch findings for (skip run creation).',
            },
            display_id: {
                type: 'string',
                description: 'Saved ATC result display ID to fetch findings for (from the ATC results list, e.g. "59D32AF578641FE1A5EE3789C160133D").',
            },
            variant: {
                type: 'string',
                description: 'ATC check variant (default DEFAULT).',
                default: 'DEFAULT',
            },
            max_results: {
                type: 'number',
                description: 'Maximum verdicts to return (default 100).',
                default: 100,
            },
        },
        required: [],
    },
};
/** All-zero worklist ID returned by SAP for unknown / invalid worklist IDs. */
const EMPTY_WORKLIST_ID = '00000000000000000000000000000000';
/**
 * Extract an attribute value from XML. When `tag` is provided, the attribute
 * must belong to a `<...tag ...>` opening tag; when `tag` is undefined (or
 * empty), the attribute is matched anywhere in the string (used for raw
 * attribute fragments).
 */
function xmlAttr(xml, tag, attr) {
    const pattern = tag
        ? `<[a-zA-Z0-9_:]*${tag}[^>]*\\b${attr}="([^"]*)"`
        : `\\b${attr}="([^"]*)"`;
    const m = xml.match(new RegExp(pattern));
    return m?.[1];
}
/**
 * Extract the worklist id from a worklist XML; null when missing/all-zero.
 * Supports both attribute (atcworklist:id="…") and element (<atcworklist:id>…)
 * forms across SAP releases.
 */
function parseWorklistId(wlXml) {
    const asAttr = xmlAttr(wlXml, 'worklist', 'id');
    const asElement = wlXml.match(/<[a-zA-Z0-9_:]*:id[^>]*>([^<]+)<\/[a-zA-Z0-9_:]*:id>/);
    const id = asAttr ?? asElement?.[1];
    if (!id || id === EMPTY_WORKLIST_ID)
        return null;
    return id;
}
/**
 * Extract the worklist id from a run-creation response; null when invalid.
 * SAP returns it as an element: <atcworklist:worklistId>DEFA…</atcworklist:worklistId>
 * (some releases use an attribute: <atc:worklistRun atc:worklistId="…"/>).
 */
function parseRunId(runXml) {
    const asElement = runXml.match(/<[a-zA-Z0-9_:]*worklistId[^>]*>([^<]+)<\/[a-zA-Z0-9_:]*worklistId>/);
    const asAttr = xmlAttr(runXml, 'worklistRun', 'worklistId');
    const id = asElement?.[1] ?? asAttr;
    if (!id || id === EMPTY_WORKLIST_ID)
        return null;
    return id;
}
/**
 * Lightweight parse of ATC XML containing `atcobject:object` / `atcfinding:
 * finding` blocks (both the worklist and the results/displayId payloads use
 * these tags). Attributes only — no heavy XML lib.
 */
function formatWorklist(wlXml, maxResults) {
    const objectBlocks = [
        ...wlXml.matchAll(/<([a-zA-Z0-9_:]*):object\b([^>]*)>([\s\S]*?)<\/\1:object>/g),
    ];
    const lines = [];
    let findingCount = 0;
    for (const [, , openAttrs, inner] of objectBlocks) {
        const objName = xmlAttr(openAttrs, undefined, 'name') ??
            xmlAttr(openAttrs, undefined, 'uri') ??
            '?';
        const findings = [
            ...inner.matchAll(/<([a-zA-Z0-9_:]*):finding\b([^>]*)\/?>/g),
        ];
        for (const [, , attrs] of findings) {
            findingCount++;
            if (findingCount > maxResults)
                continue;
            const prio = attrs.match(/\bpriority="(\d+)"/)?.[1] ?? '?';
            const checkTitle = attrs.match(/\bcheckTitle="([^"]*)"/)?.[1] ?? '';
            const checkId = attrs.match(/\bcheckId="([^"]*)"/)?.[1] ?? '';
            const messageTitle = attrs.match(/\bmessageTitle="([^"]*)"/)?.[1] ?? '';
            const location = attrs.match(/\blocation="([^"]*)"/)?.[1] ?? '';
            const line = attrs.match(/\bline="(\d+)"/)?.[1] ?? location.split('line=')[1] ?? '';
            lines.push(`[P${prio}] ${checkTitle} (${checkId})`);
            lines.push(`  ${messageTitle}`);
            lines.push(`  ${objName}${line ? ` line ${line}` : ''}`);
        }
    }
    return {
        text: lines.join('\n'),
        findingCount,
        objectCount: objectBlocks.length,
    };
}
/** Extract the result header (title / variant / runSeries / createdAt) from a
 * `/atc/results/<displayId>` payload. */
function formatResultHeader(xml) {
    const get = (tag) => {
        const m = xml.match(new RegExp(`<atcresult:${tag}>([^<]*)</atcresult:${tag}>`));
        return m ? m[1] : '';
    };
    const parts = [
        `title: ${get('title')}`,
        `checkVariant: ${get('checkVariant')}`,
        `runSeries: ${get('runSeries')}`,
        `createdAt: ${get('createdAt')}`,
    ].filter((p) => !p.endsWith(': '));
    return parts.length ? `Result: ${parts.join(' | ')}\n` : '';
}
async function handleRunAtcAnalysis(context, args) {
    const { connection, logger } = context;
    try {
        const variant = args?.variant ?? 'DEFAULT';
        const maxResults = args?.max_results ?? 100;
        const modeCount = [args?.object_url, args?.run_id, args?.display_id].filter(Boolean).length;
        if (modeCount === 0) {
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'Provide one of object_url, run_id or display_id.');
        }
        if (modeCount > 1) {
            throw new utils_js_1.McpError(utils_js_1.ErrorCode.InvalidParams, 'Provide only one of object_url, run_id or display_id.');
        }
        let wlXml;
        let label;
        if (args?.display_id) {
            // Mode 3: saved result by display ID — payload is a resultList.
            const resp = await connection.makeAdtRequest({
                url: `/sap/bc/adt/atc/results/${encodeURIComponent(args.display_id)}`,
                method: 'GET',
                timeout: 120_000,
                headers: { Accept: 'application/xml' },
            });
            wlXml =
                typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
            if (!wlXml || !/<atcresult:resultList/i.test(wlXml)) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `ATC result display ID "${args.display_id}" was not found or returned no payload.`,
                        },
                    ],
                };
            }
            const header = formatResultHeader(wlXml);
            const { text, findingCount, objectCount } = formatWorklist(wlXml, maxResults);
            if (findingCount === 0) {
                return {
                    isError: false,
                    content: [
                        {
                            type: 'text',
                            text: `${header}✅ No ATC findings for display ID ${args.display_id}`,
                        },
                    ],
                };
            }
            return {
                isError: false,
                content: [
                    {
                        type: 'text',
                        text: `${header}ATC findings for display ID ${args.display_id}: ${findingCount} verdicts across ${objectCount} objects\n${text}`,
                    },
                ],
            };
        }
        if (args?.run_id) {
            // Mode 2: existing run worklist by worklist ID.
            const resp = await connection.makeAdtRequest({
                url: `/sap/bc/adt/atc/worklists/${encodeURIComponent(args.run_id)}`,
                method: 'GET',
                timeout: 120_000,
                headers: { Accept: 'application/atc.worklist.v1+xml' },
            });
            wlXml =
                typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
            if (!parseWorklistId(wlXml)) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `ATC run/worklist "${args.run_id}" was not found or is not accessible (SAP returned an empty worklist). Check the run ID and that the ATC run has completed.`,
                        },
                    ],
                };
            }
            label = `run ${args.run_id}`;
        }
        else {
            // Mode 1: create a new run for an object URL.
            const mainUrl = args.object_url;
            const runBody = `<?xml version="1.0" encoding="UTF-8"?>\n` +
                `<atc:run maximumVerdicts="${Math.max(maxResults, 1)}" xmlns:atc="http://www.sap.com/adt/atc">` +
                `<objectSets xmlns:adtcore="http://www.sap.com/adt/core">` +
                `<objectSet kind="inclusive">` +
                `<adtcore:objectReferences>` +
                `<adtcore:objectReference adtcore:uri="${mainUrl}"/>` +
                `</adtcore:objectReferences>` +
                `</objectSet>` +
                `</objectSets>` +
                `</atc:run>`;
            const runResp = await connection.makeAdtRequest({
                url: `/sap/bc/adt/atc/runs?worklistId=${variant}`,
                method: 'POST',
                timeout: 120_000,
                data: runBody,
                headers: {
                    Accept: 'application/xml',
                    'Content-Type': 'application/xml',
                },
            });
            const runXml = typeof runResp.data === 'string'
                ? runResp.data
                : JSON.stringify(runResp.data);
            const runId = parseRunId(runXml);
            if (!runId) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `ATC run created but no valid worklistId found in response:\n${runXml.slice(0, 1000)}`,
                        },
                    ],
                };
            }
            const wlResp = await connection.makeAdtRequest({
                url: `/sap/bc/adt/atc/worklists/${runId}`,
                method: 'GET',
                timeout: 120_000,
                headers: { Accept: 'application/atc.worklist.v1+xml' },
            });
            wlXml =
                typeof wlResp.data === 'string'
                    ? wlResp.data
                    : JSON.stringify(wlResp.data);
            // SAP returns an all-zero worklist template for invalid / not-ready
            // runs instead of an error — surface that instead of "no findings".
            if (!parseWorklistId(wlXml)) {
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `ATC run ${runId} returned an empty worklist. The run may not exist, not be accessible, or not have completed yet.`,
                        },
                    ],
                };
            }
            label = `${mainUrl} (run ${runId}, variant ${variant})`;
        }
        const { text, findingCount, objectCount } = formatWorklist(wlXml, maxResults);
        if (findingCount === 0) {
            return {
                isError: false,
                content: [
                    {
                        type: 'text',
                        text: `✅ No ATC findings for ${label}`,
                    },
                ],
            };
        }
        const truncated = findingCount > maxResults
            ? ` (first ${maxResults} of ${findingCount})`
            : '';
        return {
            isError: false,
            content: [
                {
                    type: 'text',
                    text: `${label}: ${findingCount} verdicts across ${objectCount} objects${truncated}\n${text}`,
                },
            ],
        };
    }
    catch (error) {
        logger?.error('RunAtcAnalysis failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
//# sourceMappingURL=handleRunAtcAnalysis.js.map