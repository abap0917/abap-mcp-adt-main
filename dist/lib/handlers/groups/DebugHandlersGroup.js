"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugHandlersGroup = void 0;
const handleAbapDebug_1 = require("../../../handlers/debugger/handleAbapDebug");
const handleRunAtcAnalysis_1 = require("../../../handlers/quality/handleRunAtcAnalysis");
const BaseHandlerGroup_js_1 = require("../base/BaseHandlerGroup.js");
const [DebugSession_Tool, DebugSetBreakpoint_Tool, DebugDeleteBreakpoint_Tool, DebugStep_Tool, DebugVariable_Tool, DebugStack_Tool, DebugSetVariable_Tool,] = handleAbapDebug_1.TOOL_DEFINITIONS;
/**
 * Debugger + ATC quality tool group.
 *
 * Exposed via --exposition=debug (or readonly,debug). Debug tools execute code /
 * drive the debugger — restricted to DEV tiers by readonlyGuard.
 */
class DebugHandlersGroup extends BaseHandlerGroup_js_1.BaseHandlerGroup {
    groupName = 'DebugHandlers';
    getHandlers() {
        return [
            {
                toolDefinition: DebugSession_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugSession)(this.context, a),
            },
            {
                toolDefinition: DebugSetBreakpoint_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugSetBreakpoint)(this.context, a),
            },
            {
                toolDefinition: DebugDeleteBreakpoint_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugDeleteBreakpoint)(this.context, a),
            },
            {
                toolDefinition: DebugStep_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugStep)(this.context, a),
            },
            {
                toolDefinition: DebugVariable_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugVariable)(this.context, a),
            },
            {
                toolDefinition: DebugStack_Tool,
                handler: () => (0, handleAbapDebug_1.handleAbapDebugStack)(this.context),
            },
            {
                toolDefinition: DebugSetVariable_Tool,
                handler: (a) => (0, handleAbapDebug_1.handleAbapDebugSetVariable)(this.context, a),
            },
            {
                toolDefinition: handleRunAtcAnalysis_1.TOOL_DEFINITION,
                handler: (a) => (0, handleRunAtcAnalysis_1.handleRunAtcAnalysis)(this.context, a),
            },
        ];
    }
}
exports.DebugHandlersGroup = DebugHandlersGroup;
//# sourceMappingURL=DebugHandlersGroup.js.map