/**
 * Table extraction blocklist (defense-in-depth, server-side).
 *
 * Even when a downstream client (Claude Code, custom MCP host) does not
 * enforce an extraction policy, this guard refuses row-returning calls
 * (`GetTableContents`, `GetSqlQuery`) against tables containing PII,
 * credentials, payroll, banking, or other protected data.
 *
 * Schema-only calls (`GetTable`, `GetStructure`, `GetView`,
 * `GetDataElement`, `GetDomain`) are unaffected — they return DDIC
 * metadata, not rows.
 *
 * ## Profiles
 *   - `minimal`  — PII + credentials only
 *   - `standard` — minimal + Protected Business Data        (default)
 *   - `strict`   — standard + Audit/Security + Comm/Workflow
 *   - `off`     — disable the guard entirely (NOT recommended)
 *
 * Configure via env:
 *   - `MCP_BLOCKLIST_PROFILE`  — one of the profile names above
 *   - `MCP_BLOCKLIST_EXTEND`   — comma-separated extra names/patterns (always denied)
 *   - `MCP_ALLOW_TABLE`        — comma-separated names to whitelist for the
 *                                current process (audited via stderr)
 *
 * Patterns use `*` as `[A-Z0-9_]*` and are matched case-insensitively.
 */
export type BlocklistAction = 'deny' | 'ask';
export type BlocklistTier = 'minimal' | 'standard' | 'strict';
export type BlocklistProfile = BlocklistTier | 'off';
export interface BlocklistEntry {
    category: string;
    tier: BlocklistTier;
    action: BlocklistAction;
    why: string;
}
export interface BlocklistMatch extends BlocklistEntry {
    table: string;
}
/**
 * True when the SELECT projection contains only aggregate calls
 * (COUNT/SUM/MIN/MAX/AVG) and no plain column references. Used to exempt
 * row-count and aggregate queries from the blocklist — they don't return
 * row-level PII even on protected tables.
 *
 * Rejects: subqueries, UNION, GROUP BY (which surfaces grouping keys).
 */
export declare function isAggregateOnly(sql: string): boolean;
/**
 * Extract candidate table names from a freestyle SQL string.
 * Matches `FROM table` and `JOIN table` (no schema qualifier).
 */
export declare function extractTablesFromSql(sql: string): string[];
/**
 * Check a list of candidate table names against the active blocklist.
 * Whitelisted entries (`MCP_ALLOW_TABLE`) are removed from the result and
 * logged to stderr for audit.
 */
export declare function checkTables(names: string[]): BlocklistMatch[];
/**
 * Build a human-readable refusal message for a set of blocklist hits.
 */
export declare function formatRefusal(hits: BlocklistMatch[], profile?: BlocklistProfile): string;
/**
 * Build a user-confirmation prompt for 'ask'-tier hits. The caller is
 * expected to surface this to the user and re-invoke the tool with
 * `acknowledge_risk: true` once the user has authorized the extraction.
 */
export declare function formatAskPrompt(hits: BlocklistMatch[], profile?: BlocklistProfile): string;
/**
 * Partition hits by action. 'deny' hits are hard-blocked; 'ask' hits may
 * be bypassed with an explicit user acknowledgement (`acknowledge_risk`).
 */
export declare function partitionHits(hits: BlocklistMatch[]): {
    deny: BlocklistMatch[];
    ask: BlocklistMatch[];
};
/**
 * Evaluate blocklist hits against a user-provided acknowledgement flag.
 * Returns one of:
 *   - { kind: 'pass' }             — no hits, or ask-only + acknowledged
 *   - { kind: 'deny',    message } — contains a 'deny' hit (hard block)
 *   - { kind: 'ask',     message } — contains 'ask' hits and not acknowledged
 *   - { kind: 'approved', tables } — ask-only AND acknowledged (caller must audit-log)
 */
export declare function evaluateHits(hits: BlocklistMatch[], acknowledgeRisk: boolean, profile?: BlocklistProfile): {
    kind: 'pass';
} | {
    kind: 'deny';
    message: string;
} | {
    kind: 'ask';
    message: string;
} | {
    kind: 'approved';
    tables: string[];
};
export declare function activeProfile(): BlocklistProfile;
//# sourceMappingURL=tableBlocklist.d.ts.map