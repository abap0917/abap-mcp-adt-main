import { AsyncLocalStorage } from 'node:async_hooks';
import type { IAbapConnection, IAdtResponse } from '@babamba2/mcp-abap-adt-interfaces';
import { getTimeout, getTimeoutConfig, type SapConfig } from '@babamba2/mcp-abap-connection';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { type AxiosResponse } from 'axios';
import { logger } from './logger';
export declare const sessionContext: AsyncLocalStorage<{
    sessionId?: string;
    sapConfig?: SapConfig;
    destination?: string;
}>;
declare global {
    var __mcpAbapAdtAuthBrokerRegistry: Map<string, any> | undefined;
}
/**
 * Register AuthBroker instance for a destination
 * This allows JwtAbapConnection to use AuthBroker for token refresh when destination is set
 */
export declare function registerAuthBroker(destination: string, authBroker: any): void;
/**
 * Get AuthBroker instance for a destination
 * Returns undefined if not registered
 * This function can be called from @babamba2/mcp-abap-connection package via global registry
 */
export declare function getAuthBroker(destination: string): any | undefined;
export { McpError, ErrorCode, getTimeout, getTimeoutConfig, logger };
export type { AxiosResponse };
/**
 * Encodes SAP object names for use in URLs.
 * Mirrors @babamba2/mcp-abap-adt-clients internal util but avoids unstable exports.
 */
export declare function encodeSapObjectName(objectName: string): string;
export declare function return_response(response: IAdtResponse | AxiosResponse): {
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
};
/**
 * Safely logs an error without circular reference issues
 */
export declare function logErrorSafely(logger: any, operationName: string, error: any): void;
/**
 * Extracts a user-facing ADT/SAP error message from Axios/ADT errors.
 * Prioritizes XML exception payloads (<exc:exception>) for detailed messages.
 */
export declare function extractAdtErrorMessage(error: any, fallback?: string): string;
export declare function return_error(error: any): {
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
};
export declare function getManagedConnection(): IAbapConnection;
/**
 * Remove connection from cache for a specific session
 * Called when session is closed
 *
 * If destination is provided, removes only the connection for that specific destination.
 * If destination is not provided, removes all connections for the session (all destinations).
 */
export declare function removeConnectionForSession(sessionId: string, config?: SapConfig, destination?: string): void;
/**
 * Restore session state in connection
 * Note: Session state management (getSessionState/setSessionState) was removed in connection 0.2.0
 * Session state persistence is now handled by @babamba2/mcp-abap-adt-auth-broker package
 * This function now only sets session type to stateful and session ID
 */
export declare function restoreSessionInConnection(connection: IAbapConnection, sessionId: string, _sessionState: {
    cookies?: string | null;
    csrf_token?: string | null;
    cookie_store?: Record<string, string>;
}): Promise<void>;
export declare function setConfigOverride(override?: SapConfig): void;
export declare function setConnectionOverride(connection?: IAbapConnection): void;
export declare function cleanup(): void;
/**
 * Invalidate cached connection to force recreation with updated config
 * This is useful when config is updated directly (e.g., token refresh in JwtAbapConnection)
 * The connection will be recreated on next getManagedConnection() call with updated signature
 */
export declare function invalidateConnectionCache(): void;
export declare function getBaseUrl(): Promise<string>;
/**
 * Makes an ADT request with specified timeout
 * @param url Request URL
 * @param method HTTP method
 * @param timeoutType Timeout type ('default', 'csrf', 'long') or custom number in ms
 * @param data Optional request data
 * @param params Optional request parameters
 * @param headers Optional custom headers
 * @returns Promise with the response
 */
export declare function makeAdtRequestWithTimeout(connection: IAbapConnection, url: string, method: string, timeoutType?: 'default' | 'csrf' | 'long' | number, data?: any, params?: any, headers?: Record<string, string>): Promise<AxiosResponse>;
/**
 * Fetches node structure from SAP ADT repository
 * @deprecated Use getAdtClient().fetchNodeStructure() instead
 */
export declare function fetchNodeStructure(_connection: IAbapConnection, _parentName: string, _parentTechName: string, _parentType: string, _nodeKey: string, _withShortDescriptions?: boolean): Promise<AxiosResponse>;
export declare function makeAdtRequest(connection: IAbapConnection, url: string, method: string, timeout: number, data?: any, params?: any, headers?: Record<string, string>): Promise<AxiosResponse>;
/**
 * Get system information from SAP ADT
 * Returns cached system context resolved during connection init
 */
export declare function getSystemInformation(): Promise<{
    systemID?: string;
    userName?: string;
} | null>;
/**
 * Check if current connection is cloud (JWT auth) or on-premise (basic auth)
 * In v2 architecture, config must come from connection provider/broker, not from getConfig()
 */
export declare function isCloudConnection(config?: SapConfig): boolean;
/**
 * Parse validation response from ADT
 * Checks for CHECK_RESULT=X (success) or SEVERITY=ERROR with message
 * @param response - IAdtResponse or AxiosResponse from validation endpoint
 * @returns Parsed validation result with valid, severity, message, exists fields
 */
export declare function parseValidationResponse(response: IAdtResponse | AxiosResponse): {
    valid: boolean;
    severity?: string;
    message?: string;
    longText?: string;
    exists?: boolean;
};
/**
 * Check if error message indicates object was already checked
 * Used to handle "has been checked" / "was checked" messages as non-critical
 * @param error - Error object or error message string
 * @returns true if error indicates object was already checked
 */
export declare function isAlreadyCheckedError(error: any): boolean;
/**
 * Check if error message indicates object already exists
 * Used to handle validation errors for existing objects
 * @param error - Error object or error message string
 * @returns true if error indicates object already exists
 */
export declare function isAlreadyExistsError(error: any): boolean;
/**
 * Safely handle check operation - ignores "already checked" errors
 * Wraps check operation and handles "has been checked" as non-critical
 * @param checkOperation - Promise that performs check operation
 * @param objectName - Name of object being checked (for logging)
 * @param logger - Optional logger function for debug messages
 * @returns Result of check operation or throws if real error
 */
export declare function safeCheckOperation<T>(checkOperation: () => Promise<T>, objectName: string, logger?: {
    debug?: (message: string, data?: any) => void;
}): Promise<T>;
/**
 * Display help message
 */
export declare function showHelp(): void;
export type TransportConfig = {
    type: 'stdio';
} | {
    type: 'streamable-http';
    host: string;
    port: number;
    enableJsonResponse: boolean;
    allowedOrigins?: string[];
    allowedHosts?: string[];
    enableDnsRebindingProtection: boolean;
} | {
    type: 'sse';
    host: string;
    port: number;
    allowedOrigins?: string[];
    allowedHosts?: string[];
    enableDnsRebindingProtection: boolean;
};
export declare function getArgValue(name: string): string | undefined;
export declare function hasFlag(name: string): boolean;
export declare function parseBoolean(value?: string): boolean;
export declare function resolvePortOption(argName: string, envName: string, defaultValue: number): number;
export declare function resolveBooleanOption(argName: string, envName: string, defaultValue: boolean): boolean;
export declare function resolveListOption(argName: string, envName: string): string[] | undefined;
export declare function parseTransportConfig(transportType: string): TransportConfig;
export interface ServerOptions {
    sapConfig?: SapConfig;
    connection?: IAbapConnection;
    transportConfig?: TransportConfig;
    allowProcessExit?: boolean;
    registerSignalHandlers?: boolean;
}
export declare function setSapConfigOverride(config?: SapConfig): void;
export declare function setAbapConnectionOverride(connection?: IAbapConnection): void;
export * from '@babamba2/mcp-abap-adt-interfaces';
export declare function getConfig(): SapConfig;
/**
 * Mask sensitive values (tokens, secrets) for safe logging
 *
 * Rules:
 * - Long values (>20 chars): show first 4 and last 4 chars with *** in between
 * - Short values (<=20 chars): fully mask with asterisks
 * - Empty/undefined: return placeholder
 *
 * @param value - The sensitive value to mask
 * @param placeholder - Placeholder for empty values (default: '(not set)')
 * @returns Masked string safe for logging
 */
export declare function maskSensitiveValue(value: string | undefined | null, placeholder?: string): string;
/**
 * Format auth configuration for display at server startup
 * Shows connection details with masked sensitive values
 */
export interface AuthDisplayConfig {
    envFile?: string;
    serviceUrl?: string;
    sapClient?: string;
    authType?: string;
    username?: string;
    password?: string;
    jwtToken?: string;
    refreshToken?: string;
    uaaUrl?: string;
    uaaClientId?: string;
    uaaClientSecret?: string;
}
/**
 * Format auth configuration for console output
 * @param config - Auth configuration to display
 * @param source - Source of the config (e.g., 'e19.env', 'service-key')
 * @returns Formatted string for console output
 */
export declare function formatAuthConfigForDisplay(config: AuthDisplayConfig, source?: string): string;
export declare function parseActivationResponse(responseData: any): {
    activated: boolean;
    checked: boolean;
    generated: boolean;
    messages: {
        type: string;
        text: string;
        line?: number;
        column?: number;
    }[];
};
//# sourceMappingURL=utils.d.ts.map