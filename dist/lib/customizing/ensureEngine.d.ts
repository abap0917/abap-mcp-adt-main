/**
 * ensureEngine — autoDeploy gate for the customizing write tools (aligned with
 * upstream abap-config-mcp's `autoDeploy` semantics).
 *
 * Behaviour (skipped entirely when autoDeploy === false):
 *   1. Fast path: ping the engine. If reachable AND the deployed version
 *      matches ENGINE_VERSION, nothing to do.
 *   2. Otherwise read the deployed class source from SAP and compare its
 *      `c_version` constant (covers hand-deployed classes that kept the
 *      {{ENGINE_VERSION}} placeholder), plus check the writer report exists.
 *   3. Missing or stale → deploy class + writer report (create / update-in-
 *      place + activate) via deployEngine.
 *   4. Ping again; if the engine is still unreachable, the ABAP side is fine
 *      but the SICF node is not — throw a targeted error with registration
 *      instructions (SICF can never be auto-registered headlessly).
 */
import type { HandlerContext } from '../../handlers/interfaces.js';
import { type DeployOptions } from './deployEngine.js';
/**
 * Ensure the customizing engine is deployed and reachable before a write.
 * @returns a human-readable note of what was done ('' when already fresh).
 */
export declare function ensureEngine(context: HandlerContext, opts?: {
    autoDeploy?: boolean;
} & DeployOptions): Promise<string>;
//# sourceMappingURL=ensureEngine.d.ts.map