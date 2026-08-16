import type { ILogger } from '@babamba2/mcp-abap-adt-interfaces';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetSqlQuery";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Execute ABAP SQL SELECT queries on database tables and CDS views via SAP ADT Data Preview API. Use for ad-hoc data retrieval, row counts, and filtered queries.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly sql_query: {
                readonly type: "string";
                readonly description: "SQL query to execute";
            };
            readonly row_number: {
                readonly type: "number";
                readonly description: "[read-only] Maximum number of rows to return";
                readonly default: 100;
            };
            readonly acknowledge_risk: {
                readonly type: "boolean";
                readonly description: "Set to true ONLY after the user has explicitly authorized row extraction from an 'ask'-tier protected table. The approval is logged to stderr for audit. Has no effect on 'deny'-tier tables.";
                readonly default: false;
            };
        };
        readonly required: readonly ["sql_query"];
    };
};
/**
 * Interface for SQL query execution response
 */
export interface SqlQueryResponse {
    sql_query: string;
    row_number: number;
    execution_time?: number;
    total_rows?: number;
    columns: Array<{
        name: string;
        type: string;
        description?: string;
        length?: number;
    }>;
    rows: Array<Record<string, any>>;
}
/**
 * Parse SAP ADT XML response from freestyle SQL query and convert to JSON format
 * @param xmlData - Raw XML response from ADT
 * @param sqlQuery - Original SQL query
 * @param rowNumber - Number of rows requested
 * @returns Parsed SQL query response
 */
export declare function parseSqlQueryXml(xmlData: string, sqlQuery: string, rowNumber: number, logger?: ILogger): SqlQueryResponse;
/**
 * Handler to execute freestyle SQL queries via SAP ADT Data Preview API
 *
 * @param args - Tool arguments containing sql_query and optional row_number parameter
 * @returns Response with parsed SQL query results or error
 */
export declare function handleGetSqlQuery(context: HandlerContext, args: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=handleGetSqlQuery.d.ts.map