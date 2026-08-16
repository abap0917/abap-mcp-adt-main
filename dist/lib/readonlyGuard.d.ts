/**
 * Tier-based readonly enforcement for MCP tool calls.
 *
 * This is the server-side layer of the two-layer defense described in
 * docs/architecture: a client-side PreToolUse hook (sc4sap plugin) rejects
 * calls quickly and explains the reason; this guard is the uncircumventable
 * last line of defense that fires even when the hook is missing, disabled,
 * or never installed.
 *
 * Block matrix (Strict policy, see sc4sap multi-profile-design.md §4):
 *
 *   Tool family                                DEV   QA   PRD
 *   Create* / Update* / Delete*                 ✓    ✗    ✗
 *   CreateTransport                             ✓    ✗    ✗   (subset of Create*)
 *   RunUnitTest                                 ✓    ✓    ✗
 *   RuntimeRunProgramWithProfiling              ✓    ✗    ✗
 *   RuntimeRunClassWithProfiling                ✓    ✗    ✗
 *   RuntimeAnalyze* / RuntimeGet* / List*       ✓    ✓    ✓
 *   Get* / Read* / Search*                      ✓    ✓    ✓
 */
import { type Tier } from './profile';
/**
 * Returns `null` if the tool is allowed on the given tier, else a short reason
 * string that explains why it is blocked.
 */
export declare function checkToolAllowed(toolName: string, tier: Tier): string | null;
/**
 * Throws an `McpError` if the named tool is not allowed on the currently
 * active profile's tier. Called by the registration wrapper in
 * BaseHandlerGroup so every tool is guarded from a single chokepoint.
 */
export declare function guardTool(toolName: string): void;
//# sourceMappingURL=readonlyGuard.d.ts.map