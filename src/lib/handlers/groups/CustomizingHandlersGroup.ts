import {
  TOOL_DEFINITIONS as CustomizingWrite_Tools,
  handleCustomizingApply,
  handleCustomizingCreate,
  handleCustomizingStatus,
} from '../../../handlers/customizing/high/handleCustomizingWrite';
import {
  TOOL_DEFINITIONS as EngineLifecycle_Tools,
  handleCustomizingEngineBootstrap,
  handleCustomizingEngineCleanup,
  handleCustomizingEnginePing,
  handleCustomizingEngineSelftest,
} from '../../../handlers/customizing/high/handleEngineLifecycle';
import {
  handleOrgCopy,
  TOOL_DEFINITION as OrgCopy_Tool,
} from '../../../handlers/customizing/high/handleOrgCopy';
import {
  TOOL_DEFINITIONS as CustomizingCompare_Tools,
  handleCustomizingDiff,
  handleCustomizingPlanChange,
} from '../../../handlers/customizing/readonly/handleCustomizingCompare';
import {
  TOOL_DEFINITION as CustomizingDescribe_Tool,
  handleCustomizingDescribe,
} from '../../../handlers/customizing/readonly/handleCustomizingDescribe';
import {
  TOOL_DEFINITION as CustomizingRead_Tool,
  handleCustomizingRead,
} from '../../../handlers/customizing/readonly/handleCustomizingRead';
import {
  handleImgSearch,
  TOOL_DEFINITION as ImgSearch_Tool,
} from '../../../handlers/customizing/readonly/handleImgSearch';
import {
  handleAbapMemoryReport,
  handleHanaMemoryReport,
  TOOL_DEFINITIONS as MemoryReport_Tools,
} from '../../../handlers/customizing/readonly/handleMemoryReport';
import { BaseHandlerGroup } from '../base/BaseHandlerGroup.js';
import type { HandlerEntry } from '../interfaces.js';

const [CustomizingDiff_Tool, CustomizingPlanChange_Tool] =
  CustomizingCompare_Tools;
const [HanaMemoryReport_Tool, AbapMemoryReport_Tool] = MemoryReport_Tools;
const [
  EngineBootstrap_Tool,
  EnginePing_Tool,
  EngineSelftest_Tool,
  EngineCleanup_Tool,
] = EngineLifecycle_Tools;
const [CustomizingApply_Tool, CustomizingCreate_Tool, CustomizingStatus_Tool] =
  CustomizingWrite_Tools;

/**
 * Customizing & IMG tool group (ported from abap-config-mcp).
 *
 * Exposed via --exposition=customizing (or readonly,customizing).
 */
export class CustomizingHandlersGroup extends BaseHandlerGroup {
  protected groupName = 'CustomizingHandlers';

  getHandlers(): HandlerEntry[] {
    return [
      {
        toolDefinition: ImgSearch_Tool,
        handler: (a: any) => handleImgSearch(this.context, a),
      },
      {
        toolDefinition: CustomizingDescribe_Tool,
        handler: (a: any) => handleCustomizingDescribe(this.context, a),
      },
      {
        toolDefinition: CustomizingRead_Tool,
        handler: (a: any) => handleCustomizingRead(this.context, a),
      },
      {
        toolDefinition: CustomizingDiff_Tool,
        handler: (a: any) => handleCustomizingDiff(this.context, a),
      },
      {
        toolDefinition: CustomizingPlanChange_Tool,
        handler: (a: any) => handleCustomizingPlanChange(this.context, a),
      },
      {
        toolDefinition: CustomizingApply_Tool,
        handler: (a: any) => handleCustomizingApply(this.context, a),
      },
      {
        toolDefinition: CustomizingCreate_Tool,
        handler: (a: any) => handleCustomizingCreate(this.context, a),
      },
      {
        toolDefinition: CustomizingStatus_Tool,
        handler: (a: any) => handleCustomizingStatus(this.context, a),
      },
      {
        toolDefinition: OrgCopy_Tool,
        handler: (a: any) => handleOrgCopy(this.context, a),
      },
      {
        toolDefinition: EngineBootstrap_Tool,
        handler: (a: any) => handleCustomizingEngineBootstrap(this.context, a),
      },
      {
        toolDefinition: EnginePing_Tool,
        handler: () => handleCustomizingEnginePing(this.context),
      },
      {
        toolDefinition: EngineSelftest_Tool,
        handler: (a: any) => handleCustomizingEngineSelftest(this.context, a),
      },
      {
        toolDefinition: EngineCleanup_Tool,
        handler: (a: any) => handleCustomizingEngineCleanup(this.context, a),
      },
      {
        toolDefinition: HanaMemoryReport_Tool,
        handler: () => handleHanaMemoryReport(this.context),
      },
      {
        toolDefinition: AbapMemoryReport_Tool,
        handler: () => handleAbapMemoryReport(this.context),
      },
    ];
  }
}
