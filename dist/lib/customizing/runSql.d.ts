/**
 * Customizing read-only data access via ADT Data Preview freestyle SQL.
 *
 * Ported from abap-config-mcp. The Data Preview endpoint rejects `LIKE`
 * (HTTP 400) — keyword filtering is always done client-side; SQL only uses
 * key ranges. Queries run through the same ADT client path as GetSqlQuery.
 */
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
/** A row keyed by column name, all values stringified/trimmed. */
export type SqlRow = Record<string, string>;
export declare function runSql(connection: IAbapConnection, logger: ILogger | undefined, sql: string, maxRows?: number): Promise<SqlRow[]>;
/** runSql that resolves to [] on any failure (query helper). */
export declare function sql1(connection: IAbapConnection, logger: ILogger | undefined, sql: string): Promise<SqlRow[]>;
/** First non-empty column value (project convention). */
export declare function col(row: SqlRow, ...names: string[]): string;
//# sourceMappingURL=runSql.d.ts.map