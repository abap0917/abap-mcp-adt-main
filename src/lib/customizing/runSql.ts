/**
 * Customizing read-only data access via ADT Data Preview freestyle SQL.
 *
 * Ported from abap-config-mcp. The Data Preview endpoint rejects `LIKE`
 * (HTTP 400) — keyword filtering is always done client-side; SQL only uses
 * key ranges. Queries run through the same ADT client path as GetSqlQuery.
 */

import type {
  IAbapConnection,
  ILogger,
} from '@babamba2/mcp-abap-adt-interfaces';
import { parseSqlQueryXml } from '../../handlers/system/readonly/handleGetSqlQuery';
import { createAdtClient } from '../clients';

/** A row keyed by column name, all values stringified/trimmed. */
export type SqlRow = Record<string, string>;

export async function runSql(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  sql: string,
  maxRows = 200,
): Promise<SqlRow[]> {
  const client = createAdtClient(connection, logger);
  const response = await client.getUtils().getSqlQuery({
    sql_query: sql,
    row_number: maxRows,
  });
  if (response.status !== 200 || !response.data) {
    throw new Error(
      `ADT SQL failed (status ${response.status}): ${sql.slice(0, 160)}`,
    );
  }
  const parsed = parseSqlQueryXml(response.data, sql, maxRows, logger);
  return parsed.rows.map((r) =>
    Object.fromEntries(
      Object.entries(r).map(([k, v]) => [
        k,
        v === null || v === undefined ? '' : String(v).trim(),
      ]),
    ),
  );
}

/** runSql that resolves to [] on any failure (query helper). */
export async function sql1(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  sql: string,
): Promise<SqlRow[]> {
  try {
    return await runSql(connection, logger, sql, 200);
  } catch {
    return [];
  }
}

/** First non-empty column value (project convention). */
export function col(row: SqlRow, ...names: string[]): string {
  for (const n of names) if (row[n] !== undefined) return row[n];
  return '';
}
