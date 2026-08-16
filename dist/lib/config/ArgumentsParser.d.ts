/**
 * Unified CLI arguments parser
 * Parses command-line arguments and environment variables
 * Used by both old server (mcp_abap_adt_server) and new servers
 */
export interface ParsedArguments {
    /** Default MCP destination from --mcp parameter */
    mcp?: string;
    /** Path to .env file */
    env?: string;
    /** Custom path for auth broker storage */
    authBrokerPath?: string;
    /** Use unsafe mode */
    unsafe: boolean;
    /** Use auth-broker instead of .env file */
    useAuthBroker: boolean;
    /** Transport type */
    transport?: string;
    /** SAP connection type: http (default) or rfc (legacy systems) */
    connectionType?: 'http' | 'rfc';
    /** SAP system type override: onprem | cloud | legacy */
    systemType?: 'onprem' | 'cloud' | 'legacy';
    /** Path to YAML config file */
    config?: string;
    /** HTTP port */
    httpPort?: number;
    /** HTTP host */
    httpHost?: string;
    /** HTTP JSON response */
    httpJsonResponse?: boolean;
    /** HTTP allowed origins */
    httpAllowedOrigins?: string[];
    /** HTTP allowed hosts */
    httpAllowedHosts?: string[];
    /** HTTP enable DNS protection */
    httpEnableDnsProtection?: boolean;
    /** SSE port */
    ssePort?: number;
    /** SSE host */
    sseHost?: string;
    /** SSE allowed origins */
    sseAllowedOrigins?: string[];
    /** SSE allowed hosts */
    sseAllowedHosts?: string[];
    /** SSE enable DNS protection */
    sseEnableDnsProtection?: boolean;
    /** Port for browser auth callback server */
    browserAuthPort?: number;
}
export declare class ArgumentsParser {
    /**
     * Parse command-line arguments and environment variables
     */
    static parse(): ParsedArguments;
    /**
     * Get argument value by name
     */
    static getArgument(name: string): string | undefined;
    /**
     * Check if flag exists
     */
    static hasFlag(name: string): boolean;
}
//# sourceMappingURL=ArgumentsParser.d.ts.map