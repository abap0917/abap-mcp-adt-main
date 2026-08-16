import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerEntry } from '../interfaces.js';
/**
 * Handler group for all readonly (read-only) handlers.
 * Contains handlers that only read data without modifying the ABAP system.
 */
export declare class ReadOnlyHandlersGroup extends BaseHandlerGroup {
    protected groupName: string;
    /**
     * Gets all readonly handler entries
     */
    getHandlers(): HandlerEntry[];
}
//# sourceMappingURL=ReadOnlyHandlersGroup.d.ts.map