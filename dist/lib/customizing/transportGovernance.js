"use strict";
/**
 * Governed transport selection for customizing writes.
 *
 * Ported from abap-config-mcp. Enterprise landscapes pre-provision transports
 * (SolMan / SAP Cloud ALM) — the engine never silently mints one. A recorded
 * commit resolves its transport like so:
 *   - explicit `transport`      → used as-is (request or task; the ABAP engine
 *                                 resolves/creates the caller's modifiable task)
 *   - `createTransport: true`   → the engine creates a new Customizing request
 *   - neither                   → the tool returns an interactive prompt listing
 *                                 the open modifiable requests instead of writing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOpenRequests = listOpenRequests;
exports.resolveTransport = resolveTransport;
const systemContext_1 = require("../systemContext");
const runSql_1 = require("./runSql");
/** List open modifiable transport requests (top-level, no parent). */
async function listOpenRequests(connection, logger, opts = {}) {
    const ctx = (0, systemContext_1.getSystemContext)();
    const user = opts.user ?? (opts.showAll ? undefined : ctx.responsible || undefined);
    const userFilter = user ? ` AND AS4USER = '${user.replace(/'/g, "''")}'` : '';
    const rows = await (0, runSql_1.runSql)(connection, logger, `SELECT TRKORR, TRFUNCTION, AS4USER, TARSYSTEM FROM E070 ` +
        `WHERE TRSTATUS = 'D' AND STRKORR = '' AND TRFUNCTION IN ('W', 'K')${userFilter} ` +
        `ORDER BY TRKORR`, 100);
    return rows.map((r) => ({
        trkorr: (0, runSql_1.col)(r, 'TRKORR'),
        function: (0, runSql_1.col)(r, 'TRFUNCTION'),
        user: (0, runSql_1.col)(r, 'AS4USER'),
        target: (0, runSql_1.col)(r, 'TARSYSTEM'),
    }));
}
/**
 * Resolve how a recorded write should get its transport.
 */
async function resolveTransport(connection, logger, args, shortText) {
    if (args.transport) {
        return {
            kind: 'transport',
            transport: args.transport.trim().toUpperCase(),
        };
    }
    if (args.createTransport) {
        return { kind: 'create' };
    }
    // Interactive prompt: list open modifiable requests, flag the CTS function.
    const reqs = await listOpenRequests(connection, logger, {
        showAll: args.showAllTransports,
    });
    const mine = reqs.filter((r) => r.function === 'W');
    const lines = [
        `No transport given and createTransport not set — nothing was written.`,
        `Choose one of:`,
        `  1. Re-run with transport: "<request-or-task>" (W = Customizing request),`,
        `  2. Re-run with createTransport: true (engine creates a new Customizing request "${shortText}"),`,
        `  3. Create one in SolMan / SAP Cloud ALM and pass its number.`,
    ];
    if (reqs.length) {
        lines.push('', `Open modifiable requests${args.showAllTransports ? '' : ` for ${(0, systemContext_1.getSystemContext)().responsible || 'you'}`}:`);
        for (const r of reqs) {
            const tag = r.function === 'W' ? 'W-customizing' : 'K-workbench';
            lines.push(`  ${r.trkorr}  [${tag}]  ${r.user}  → ${r.target || '(local)'}`);
        }
    }
    else {
        lines.push('', '(no open modifiable requests found)');
    }
    if (!args.showAllTransports && mine.length === 0 && reqs.length > 0) {
        lines.push('', `Pass showAllTransports: true to list every user's open requests.`);
    }
    return { kind: 'prompt', prompt: lines.join('\n') };
}
//# sourceMappingURL=transportGovernance.js.map