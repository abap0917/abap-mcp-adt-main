import {
  TOOL_DEFINITIONS as DebugTools,
  handleAbapDebugDeleteBreakpoint,
  handleAbapDebugSession,
  handleAbapDebugSetBreakpoint,
  handleAbapDebugSetVariable,
  handleAbapDebugStack,
  handleAbapDebugStep,
  handleAbapDebugVariable,
} from '../../../handlers/debugger/handleAbapDebug';
import {
  handleRunAtcAnalysis,
  TOOL_DEFINITION as RunAtcAnalysis_Tool,
} from '../../../handlers/quality/handleRunAtcAnalysis';
import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerEntry } from '../interfaces.js';

const [
  DebugSession_Tool,
  DebugSetBreakpoint_Tool,
  DebugDeleteBreakpoint_Tool,
  DebugStep_Tool,
  DebugVariable_Tool,
  DebugStack_Tool,
  DebugSetVariable_Tool,
] = DebugTools;

/**
 * Debugger + ATC quality tool group.
 *
 * Exposed via --exposition=debug (or readonly,debug). Debug tools execute code /
 * drive the debugger — restricted to DEV tiers by readonlyGuard.
 */
export class DebugHandlersGroup extends BaseHandlerGroup {
  protected groupName = 'DebugHandlers';

  getHandlers(): HandlerEntry[] {
    return [
      {
        toolDefinition: DebugSession_Tool,
        handler: (a: any) => handleAbapDebugSession(this.context, a),
      },
      {
        toolDefinition: DebugSetBreakpoint_Tool,
        handler: (a: any) => handleAbapDebugSetBreakpoint(this.context, a),
      },
      {
        toolDefinition: DebugDeleteBreakpoint_Tool,
        handler: (a: any) => handleAbapDebugDeleteBreakpoint(this.context, a),
      },
      {
        toolDefinition: DebugStep_Tool,
        handler: (a: any) => handleAbapDebugStep(this.context, a),
      },
      {
        toolDefinition: DebugVariable_Tool,
        handler: (a: any) => handleAbapDebugVariable(this.context, a),
      },
      {
        toolDefinition: DebugStack_Tool,
        handler: () => handleAbapDebugStack(this.context),
      },
      {
        toolDefinition: DebugSetVariable_Tool,
        handler: (a: any) => handleAbapDebugSetVariable(this.context, a),
      },
      {
        toolDefinition: RunAtcAnalysis_Tool,
        handler: (a: any) => handleRunAtcAnalysis(this.context, a),
      },
    ];
  }
}
