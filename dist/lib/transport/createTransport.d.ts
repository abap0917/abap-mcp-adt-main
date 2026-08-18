/**
 * Transport request creation with corrected target handling.
 *
 * The client lib (`@babamba2/mcp-abap-adt-clients` core/transport/create.js)
 * wraps the target system in `/.../` (`tm:target="/VSD/"`), which the CTS
 * endpoint rejects / misinterprets — the ADT protocol expects the raw target
 * name (e.g. "VSD"). This module builds the request XML itself via
 * `connection.makeAdtRequest` with the raw target, and auto-discovers the
 * system's transport target(s) from E070 when the caller doesn't provide one.
 */
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
export interface TransportTargets {
    targets: string[];
    defaultTarget: string | null;
}
/** Normalize a TARSYSTEM value: trim and strip surrounding slashes ("/VSD/" → "VSD"). */
export declare function sanitizeTarget(t: string): string;
/**
 * Discover transport targets this system uses, from E070.
 * Strategy:
 *   1. GROUP BY TARSYSTEM → full distinct set + usage frequency
 *      (plain SELECT caps at the Data Preview row limit and missed targets).
 *   2. Default target = the most frequently used target, excluding 'SAP'
 *      (the system-internal target for SAP requests, not a user dev target).
 */
export declare function discoverTransportTargets(connection: IAbapConnection, logger: ILogger | undefined): Promise<TransportTargets>;
export interface CreateTransportOptions {
    description: string;
    transportType: 'workbench' | 'customizing';
    targetSystem?: string;
    owner?: string;
}
export interface CreatedTransport {
    transport_number: string;
    description: string;
    type: string;
    target_system: string;
    target_desc?: string;
    cts_project?: string;
    owner: string;
    uri?: string;
}
/** Create a transport request with a raw target (fixes the client lib's /…/ bug). */
export declare function createTransportRequest(connection: IAbapConnection, logger: ILogger | undefined, opts: CreateTransportOptions, owner: string): Promise<CreatedTransport>;
//# sourceMappingURL=createTransport.d.ts.map