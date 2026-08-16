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
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
export interface TransportDecision {
    kind: 'transport' | 'create' | 'prompt';
    transport?: string;
    prompt?: string;
}
/** List open modifiable transport requests (top-level, no parent). */
export declare function listOpenRequests(connection: IAbapConnection, logger: ILogger | undefined, opts?: {
    user?: string;
    showAll?: boolean;
}): Promise<Array<{
    trkorr: string;
    function: string;
    user: string;
    target: string;
}>>;
/**
 * Resolve how a recorded write should get its transport.
 */
export declare function resolveTransport(connection: IAbapConnection, logger: ILogger | undefined, args: {
    transport?: string;
    createTransport?: boolean;
    showAllTransports?: boolean;
}, shortText: string): Promise<TransportDecision>;
//# sourceMappingURL=transportGovernance.d.ts.map