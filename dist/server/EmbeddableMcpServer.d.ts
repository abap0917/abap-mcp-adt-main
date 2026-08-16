import type { Logger } from '@babamba2/mcp-abap-adt-logger';
import type { AbapConnection } from '@babamba2/mcp-abap-connection';
import type { IHandlersRegistry } from '../lib/handlers/interfaces.js';
import { BaseMcpServer } from './BaseMcpServer.js';
/**
 * Options for EmbeddableMcpServer
 */
export interface EmbeddableMcpServerOptions {
    /**
     * ABAP connection to use for all handler calls
     * Injected from consumer (e.g., CloudSdkAbapConnection in cloud-llm-hub)
     */
    connection: AbapConnection;
    /**
     * Logger instance
     * @default defaultLogger
     */
    logger?: Logger;
    /**
     * Handlers registry to use
     * If not provided, default registry is created based on exposition option
     */
    handlersRegistry?: IHandlersRegistry;
    /**
     * Exposition levels to include when creating default registry
     * @default ['readonly', 'high']
     */
    exposition?: ('readonly' | 'high' | 'low' | 'compact' | 'system' | 'search' | 'customizing' | 'debug')[];
    /**
     * Server version
     * @default from package.json or '1.0.0'
     */
    version?: string;
}
/**
 * Embeddable MCP Server for integration with external applications
 *
 * This server is designed for consumers like cloud-llm-hub that:
 * - Have their own connection management (e.g., BTP destinations, Cloud SDK)
 * - Create new server instance per request (SSE/HTTP mode)
 * - Need to inject connection from outside
 *
 * Usage:
 * ```typescript
 * // Create connection (consumer's own implementation)
 * const connection = new CloudSdkAbapConnection(config);
 *
 * // Create embeddable server with injected connection
 * const server = new EmbeddableMcpServer({
 *   connection,
 *   logger: myLogger,
 *   exposition: ['readonly', 'high'],
 * });
 *
 * // Connect transport and handle request
 * await server.connect(transport);
 * ```
 */
export declare class EmbeddableMcpServer extends BaseMcpServer {
    private readonly injectedConnection;
    constructor(options: EmbeddableMcpServerOptions);
    /**
     * Returns the injected connection
     * Called by BaseMcpServer.registerHandlers() wrapper lambdas
     */
    protected getConnection(): Promise<AbapConnection>;
    /**
     * Creates default handlers registry based on exposition levels
     */
    private createDefaultRegistry;
}
//# sourceMappingURL=EmbeddableMcpServer.d.ts.map