"use strict";
/**
 * ImgSearch — search SPRO/IMG activities by keyword.
 *
 * Ported from abap-config-mcp. Prefers the STREE/SHI search-text index (via the
 * deployed customizing engine's img_index_read op); falls back to the raw
 * CUS_IMGACT / CUS_ACTOBJ tables when no index/engine is available.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_DEFINITION = void 0;
exports.handleImgSearch = handleImgSearch;
const engineClient_1 = require("../../../lib/customizing/engineClient");
const runSql_1 = require("../../../lib/customizing/runSql");
const utils_1 = require("../../../lib/utils");
exports.TOOL_DEFINITION = {
    name: 'ImgSearch',
    available_in: ['onprem', 'legacy'],
    description: '[customizing] Search SAP IMG/SPRO activities by keyword (activity title). Prefers the STREE search-text index when the customizing engine is deployed; falls back to the raw CUS_IMGACT tables. Pass a namespace (e.g. "/POSDW/") to scope the raw search — free-text SQL is blocked on this system.',
    inputSchema: {
        type: 'object',
        properties: {
            keyword: {
                type: 'string',
                description: 'Keyword to match against IMG activity titles.',
            },
            namespace: {
                type: 'string',
                description: 'Activity-ID prefix to scope the raw search by, e.g. "/POSDW/" (omit for best-effort full scan).',
            },
            in_scope_only: {
                type: 'boolean',
                description: "Keep only activities in the client's activated scope (CUS_IMGACH_SCOPE).",
                default: false,
            },
            language: {
                type: 'string',
                description: 'IMG language (default E).',
                default: 'E',
            },
            max_results: {
                type: 'number',
                description: 'Maximum hits (default 200).',
                default: 200,
            },
        },
        required: ['keyword'],
    },
};
const typeLabel = {
    V: 'view→VDAT',
    S: 'table→TABU',
    C: 'cluster→CDAT',
    T: 'txn',
    D: 'doc',
};
async function imgSearchRaw(connection, logger, args) {
    const lang = (args.language ?? 'E').toUpperCase();
    const max = args.max_results ?? 200;
    const kw = args.keyword.trim().toUpperCase();
    const ns = (args.namespace ?? '').toUpperCase().replace(/'/g, "''");
    let where = `a~SPRAS = '${lang}'`;
    if (ns) {
        where += ` AND a~ACTIVITY >= '${ns}' AND a~ACTIVITY < '${ns}~'`;
    }
    const sql = `SELECT a~ACTIVITY, a~TEXT, o~OBJECTTYPE, o~OBJECTNAME, o~TCODE ` +
        `FROM CUS_IMGACT AS a ` +
        `INNER JOIN CUS_ACTOBJ AS o ON o~ACT_ID = a~ACTIVITY ` +
        `WHERE ${where} ORDER BY a~ACTIVITY`;
    let scanned = [];
    try {
        scanned = await (0, runSql_1.runSql)(connection, logger, sql, max);
    }
    catch {
        // CUS_IMGACT/CUS_ACTOBJ not query-accessible
    }
    let rows = kw
        ? scanned.filter((r) => (0, runSql_1.col)(r, 'TEXT').toUpperCase().includes(kw))
        : scanned;
    let scopeNote = '';
    if (args.in_scope_only && ns) {
        const scopeRows = await (0, runSql_1.sql1)(connection, logger, `SELECT ACTIVITY FROM CUS_IMGACH_SCOPE WHERE ACTIVITY >= '${ns}' AND ACTIVITY < '${ns}~'`);
        if (scopeRows.length > 0) {
            const inScope = new Set(scopeRows.map((r) => (0, runSql_1.col)(r, 'ACTIVITY')));
            rows = rows.filter((r) => inScope.has((0, runSql_1.col)(r, 'ACTIVITY')));
        }
        else {
            scopeNote = `\n(in_scope_only ignored — no scoping data in CUS_IMGACH_SCOPE for ${args.namespace})`;
        }
    }
    if (rows.length === 0) {
        const hint = ns
            ? `No IMG activities in ${args.namespace} with a title containing "${args.keyword}".`
            : `No matches. This system blocks free-text SQL search, so pass a namespace ` +
                `(e.g. namespace: "/POSDW/") to scope the IMG index, then filter by keyword.`;
        return hint;
    }
    const scope = ns ? ` in ${args.namespace}` : '';
    const lines = [
        `IMG activities${scope} matching "${args.keyword}" (${rows.length}):`,
        '',
        `${'IMG activity'.padEnd(22)} ${'Title'.padEnd(45)} ${'Type'.padEnd(12)} ${'Object'.padEnd(24)} Tcode`,
        '-'.repeat(120),
    ];
    for (const r of rows) {
        const act = (0, runSql_1.col)(r, 'ACTIVITY').padEnd(22);
        const title = (0, runSql_1.col)(r, 'TEXT').slice(0, 45).padEnd(45);
        const t = (0, runSql_1.col)(r, 'OBJECTTYPE');
        const type = (typeLabel[t] ?? t).padEnd(12);
        const obj = (0, runSql_1.col)(r, 'OBJECTNAME').padEnd(24);
        lines.push(`${act} ${title} ${type} ${obj} ${(0, runSql_1.col)(r, 'TCODE')}`);
    }
    lines.push('', 'Use CustomizingDescribe <object> to see the table set, key fields, and transport object.', 'source: CUS_IMGACT raw IMG tables (no STREE search index)');
    if (scopeNote)
        lines.push(scopeNote.trim());
    return lines.join('\n');
}
async function imgSearchViaIndex(connection, logger, args) {
    const lang = (args.language ?? 'E').toUpperCase().slice(0, 1);
    const max = args.max_results ?? 200;
    const kw = args.keyword.trim();
    const genRows = await (0, runSql_1.runSql)(connection, logger, `SELECT TREE_ID, SPRAS, GEN_DATE FROM TTREESRCH ORDER BY GEN_DATE DESCENDING`, 100);
    if (genRows.length === 0)
        return null;
    const genByTree = new Map();
    for (const r of genRows) {
        const id = (0, runSql_1.col)(r, 'TREE_ID');
        if (!genByTree.has(id))
            genByTree.set(id, (0, runSql_1.col)(r, 'GEN_DATE'));
    }
    const ids = [...genByTree.keys()].slice(0, 6);
    const inList = ids.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
    const imgRows = await (0, runSql_1.sql1)(connection, logger, `SELECT ID FROM TTREE WHERE TYPE = 'IMG' AND ID IN (${inList})`);
    const imgIds = new Set(imgRows.map((r) => (0, runSql_1.col)(r, 'ID')));
    const trees = ids.filter((id) => imgIds.has(id));
    if (trees.length === 0)
        return null;
    const hits = [];
    const sources = [];
    for (const t of trees.slice(0, 3)) {
        let res;
        try {
            res = await (0, engineClient_1.callEngine)(connection, logger, 'img_index_read', {
                structure_id: t,
                language: lang,
                keyword: kw,
                max_rows: max,
            });
        }
        catch {
            continue;
        }
        if (res.STATUS === 'no_index')
            continue;
        let parsed = [];
        try {
            parsed = res.DATA_JSON ? JSON.parse(res.DATA_JSON) : [];
        }
        catch {
            parsed = [];
        }
        sources.push(`STREE index ${t} @${genByTree.get(t)}`);
        for (const h of parsed)
            hits.push(h);
        if (hits.length >= max)
            break;
    }
    if (sources.length === 0)
        return null;
    if (hits.length === 0) {
        return (`No IMG nodes matching "${args.keyword}".\n` +
            `source: ${sources.join('; ')} (index used, vs. raw IMG tables)`);
    }
    const lines = [
        `IMG nodes matching "${args.keyword}" (${hits.length}) — via search index:`,
        '',
    ];
    for (const h of hits.slice(0, max)) {
        const path = h.PATH || h.TEXT;
        const ext = h.EXTENSION ? `   [${h.EXTENSION}]` : '';
        lines.push(`• ${path}${ext}`);
    }
    lines.push('', `source: ${sources.join('; ')}  (index used — vs. raw IMG tables)`, 'Use CustomizingDescribe <object> for the table set + transport object.');
    return lines.join('\n');
}
async function handleImgSearch(context, args) {
    const { connection, logger } = context;
    try {
        if (!args?.keyword?.trim()) {
            throw new utils_1.McpError(utils_1.ErrorCode.InvalidParams, 'keyword is required');
        }
        // Prefer the STREE/SHI index (engine-backed); fall back to raw tables.
        if (args.keyword.trim()) {
            try {
                const viaIndex = await imgSearchViaIndex(connection, logger, args);
                if (viaIndex) {
                    return {
                        isError: false,
                        content: [{ type: 'text', text: viaIndex }],
                    };
                }
            }
            catch (err) {
                logger?.debug('ImgSearch: index path failed, falling back to raw IMG tables', err);
            }
        }
        const text = await imgSearchRaw(connection, logger, args);
        return { isError: false, content: [{ type: 'text', text }] };
    }
    catch (error) {
        logger?.error('ImgSearch failed', error);
        return {
            isError: true,
            content: [
                { type: 'text', text: String(error?.message ?? error) },
            ],
        };
    }
}
//# sourceMappingURL=handleImgSearch.js.map