import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerEntry } from '../interfaces.js';
/**
 * Debugger + ATC quality tool group.
 *
 * Exposed via --exposition=debug (or readonly,debug). Debug tools execute code /
 * drive the debugger — restricted to DEV tiers by readonlyGuard.
 */
export declare class DebugHandlersGroup extends BaseHandlerGroup {
    protected groupName: string;
    getHandlers(): HandlerEntry[];
}
//# sourceMappingURL=DebugHandlersGroup.d.ts.map