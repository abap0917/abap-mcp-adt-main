/**
 * Runtime feeds helper — Atom XML parsers, feed URLs, query builder.
 *
 * Ported from fr0ster/mcp-abap-adt's FeedRepository (v5 adt-clients) so that
 * powerup can expose fr0ster's feed tools (RuntimeListSystemMessages,
 * RuntimeGetGatewayErrorLog, RuntimeListFeeds) while still pinned to
 * @babamba2/mcp-abap-adt-clients ^3.10.2, where getFeeds() returns a raw Axios
 * response instead of the IFeedRepository facade.
 *
 * Covers three ADT feeds:
 *   - /sap/bc/adt/runtime/dumps
 *   - /sap/bc/adt/runtime/systemmessages
 *   - /sap/bc/adt/gw/errorlog
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
export declare const FEED_URLS: {
    readonly dumps: "/sap/bc/adt/runtime/dumps";
    readonly systemMessages: "/sap/bc/adt/runtime/systemmessages";
    readonly gatewayErrors: "/sap/bc/adt/gw/errorlog";
};
export interface IFeedQueryOptions {
    user?: string;
    maxResults?: number;
    from?: string;
    to?: string;
}
export interface IFeedDescriptor {
    id: string;
    title: string;
    url: string;
    category?: string;
}
export interface IFeedVariant {
    id: string;
    title: string;
    url: string;
}
export interface IFeedEntry {
    id: string;
    title: string;
    updated: string;
    link: string;
    content: string;
    author?: string;
    category?: string;
}
export interface ISystemMessageEntry {
    id: string;
    title: string;
    text: string;
    severity: string;
    validFrom: string;
    validTo: string;
    createdBy: string;
}
export interface IGatewayErrorEntry {
    type: string;
    shortText: string;
    transactionId: string;
    package: string;
    applicationComponent: string;
    dateTime: string;
    username: string;
    client: string;
    requestKind: string;
    link?: string;
}
/**
 * Enriched ST22 runtime-dump feed entry — fields sourced from atom:category,
 * atom:author, atom:published, atom:link[rel=self] and the embedded HTML
 * summary (Short Text / Runtime Error / Exception / Program / App Component /
 * Date/Time / User / Client / Host).
 */
export interface IDumpFeedEntry {
    id: string;
    dumpId: string;
    detailUrl: string;
    published: string;
    updated: string;
    shortText: string;
    runtimeError: string;
    exception: string;
    program: string;
    applicationComponent: string;
    dateTime: string;
    user: string;
    client: string;
    host: string;
}
export interface ICallStackEntry {
    number: number | string;
    event: string;
    program: string;
    name: string;
    line: number | string;
}
export interface ISourceCodeLine {
    number: number | string;
    content: string;
    isError: boolean;
}
export interface IGatewayException {
    type: string;
    text: string;
    raiseLocation: string;
}
export interface IGatewayErrorDetail {
    type: string;
    shortText: string;
    transactionId: string;
    package: string;
    applicationComponent: string;
    dateTime: string;
    username: string;
    client: string;
    requestKind: string;
    serviceInfo: {
        namespace: string;
        serviceName: string;
        serviceVersion: string;
        groupId: string;
        serviceRepository: string;
        destination: string;
    };
    errorContext: {
        errorInfo: string;
        resolution: Record<string, unknown>;
        exceptions: IGatewayException[];
    };
    sourceCode: {
        lines: ISourceCodeLine[];
        errorLine: number | string;
    };
    callStack: ICallStackEntry[];
}
/**
 * Parse the `<b>Label</b></td><td>value</td>` tables embedded inside ADT feed
 * `<atom:summary type="html">` content. Returns a Map keyed by normalized
 * lowercase label ("short text", "runtime error", ...). Strips inner tags and
 * trims whitespace.
 */
export declare function parseHtmlSummaryTable(summaryHtml: string): Map<string, string>;
/**
 * Build query string for feed URLs.
 * userAttribute differs per feed: 'user' for dumps/systemMessages, 'username'
 * for gateway errors.
 */
export declare function buildFeedQueryParams(options?: IFeedQueryOptions, userAttribute?: string): string;
/**
 * Fetch a feed URL with optional query params. Accept header set to Atom XML.
 */
export declare function fetchFeed(connection: IAbapConnection, feedUrl: string, options?: IFeedQueryOptions, userAttribute?: string): Promise<import("axios").AxiosResponse<any, any, {}>>;
export declare function parseAtomFeed(xml: string): IFeedEntry[];
export declare function parseFeedDescriptors(xml: string): IFeedDescriptor[];
export declare function parseFeedVariants(xml: string): IFeedVariant[];
export declare function parseSystemMessages(xml: string): ISystemMessageEntry[];
export declare function parseGatewayErrors(xml: string): IGatewayErrorEntry[];
/**
 * Enriched parser for ST22 `/sap/bc/adt/runtime/dumps` Atom feed. Extracts
 * program, user, exception, host, etc. directly from the feed's embedded
 * HTML summary so callers don't need a per-dump detail fetch.
 */
export declare function parseRuntimeDumpFeed(xml: string): IDumpFeedEntry[];
export declare function parseGatewayErrorDetail(xml: string): IGatewayErrorDetail;
//# sourceMappingURL=runtimeFeedsHelper.d.ts.map