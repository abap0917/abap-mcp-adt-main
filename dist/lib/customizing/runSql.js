"use strict";
/**
 * Customizing read-only data access via ADT Data Preview freestyle SQL.
 *
 * Ported from abap-config-mcp. The Data Preview endpoint rejects `LIKE`
 * (HTTP 400) — keyword filtering is always done client-side; SQL only uses
 * key ranges. Queries run through the same ADT client path as GetSqlQuery.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSql = runSql;
exports.sql1 = sql1;
exports.col = col;
const handleGetSqlQuery_1 = require("../../handlers/system/readonly/handleGetSqlQuery");
const clients_1 = require("../clients");
async function runSql(connection, logger, sql, maxRows = 200) {
    const client = (0, clients_1.createAdtClient)(connection, logger);
    const response = await client.getUtils().getSqlQuery({
        sql_query: sql,
        row_number: maxRows,
    });
    if (response.status !== 200 || !response.data) {
        throw new Error(`ADT SQL failed (status ${response.status}): ${sql.slice(0, 160)}`);
    }
    const parsed = (0, handleGetSqlQuery_1.parseSqlQueryXml)(response.data, sql, maxRows, logger);
    return parsed.rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [
        k,
        v === null || v === undefined ? '' : String(v).trim(),
    ])));
}
/** runSql that resolves to [] on any failure (query helper). */
async function sql1(connection, logger, sql) {
    try {
        return await runSql(connection, logger, sql, 200);
    }
    catch {
        return [];
    }
}
/** First non-empty column value (project convention). */
function col(row, ...names) {
    for (const n of names)
        if (row[n] !== undefined)
            return row[n];
    return '';
}
//# sourceMappingURL=runSql.js.map