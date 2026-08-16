import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerEntry } from '../interfaces.js';
/**
 * Customizing & IMG tool group (ported from abap-config-mcp).
 *
 * Exposed via --exposition=customizing (or readonly,customizing).
 */
export declare class CustomizingHandlersGroup extends BaseHandlerGroup {
    protected groupName: string;
    getHandlers(): HandlerEntry[];
}
//# sourceMappingURL=CustomizingHandlersGroup.d.ts.map