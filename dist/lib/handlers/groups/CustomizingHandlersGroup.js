"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizingHandlersGroup = void 0;
const handleCustomizingWrite_1 = require("../../../handlers/customizing/high/handleCustomizingWrite");
const handleEngineLifecycle_1 = require("../../../handlers/customizing/high/handleEngineLifecycle");
const handleOrgCopy_1 = require("../../../handlers/customizing/high/handleOrgCopy");
const handleCustomizingCompare_1 = require("../../../handlers/customizing/readonly/handleCustomizingCompare");
const handleCustomizingDescribe_1 = require("../../../handlers/customizing/readonly/handleCustomizingDescribe");
const handleCustomizingRead_1 = require("../../../handlers/customizing/readonly/handleCustomizingRead");
const handleImgSearch_1 = require("../../../handlers/customizing/readonly/handleImgSearch");
const handleMemoryReport_1 = require("../../../handlers/customizing/readonly/handleMemoryReport");
const BaseHandlerGroup_js_1 = require("../base/BaseHandlerGroup.js");
const [CustomizingDiff_Tool, CustomizingPlanChange_Tool] = handleCustomizingCompare_1.TOOL_DEFINITIONS;
const [HanaMemoryReport_Tool, AbapMemoryReport_Tool] = handleMemoryReport_1.TOOL_DEFINITIONS;
const [EngineBootstrap_Tool, EnginePing_Tool, EngineSelftest_Tool, EngineCleanup_Tool,] = handleEngineLifecycle_1.TOOL_DEFINITIONS;
const [CustomizingApply_Tool, CustomizingCreate_Tool, CustomizingStatus_Tool] = handleCustomizingWrite_1.TOOL_DEFINITIONS;
/**
 * Customizing & IMG tool group (ported from abap-config-mcp).
 *
 * Exposed via --exposition=customizing (or readonly,customizing).
 */
class CustomizingHandlersGroup extends BaseHandlerGroup_js_1.BaseHandlerGroup {
    groupName = 'CustomizingHandlers';
    getHandlers() {
        return [
            {
                toolDefinition: handleImgSearch_1.TOOL_DEFINITION,
                handler: (a) => (0, handleImgSearch_1.handleImgSearch)(this.context, a),
            },
            {
                toolDefinition: handleCustomizingDescribe_1.TOOL_DEFINITION,
                handler: (a) => (0, handleCustomizingDescribe_1.handleCustomizingDescribe)(this.context, a),
            },
            {
                toolDefinition: handleCustomizingRead_1.TOOL_DEFINITION,
                handler: (a) => (0, handleCustomizingRead_1.handleCustomizingRead)(this.context, a),
            },
            {
                toolDefinition: CustomizingDiff_Tool,
                handler: (a) => (0, handleCustomizingCompare_1.handleCustomizingDiff)(this.context, a),
            },
            {
                toolDefinition: CustomizingPlanChange_Tool,
                handler: (a) => (0, handleCustomizingCompare_1.handleCustomizingPlanChange)(this.context, a),
            },
            {
                toolDefinition: CustomizingApply_Tool,
                handler: (a) => (0, handleCustomizingWrite_1.handleCustomizingApply)(this.context, a),
            },
            {
                toolDefinition: CustomizingCreate_Tool,
                handler: (a) => (0, handleCustomizingWrite_1.handleCustomizingCreate)(this.context, a),
            },
            {
                toolDefinition: CustomizingStatus_Tool,
                handler: (a) => (0, handleCustomizingWrite_1.handleCustomizingStatus)(this.context, a),
            },
            {
                toolDefinition: handleOrgCopy_1.TOOL_DEFINITION,
                handler: (a) => (0, handleOrgCopy_1.handleOrgCopy)(this.context, a),
            },
            {
                toolDefinition: EngineBootstrap_Tool,
                handler: (a) => (0, handleEngineLifecycle_1.handleCustomizingEngineBootstrap)(this.context, a),
            },
            {
                toolDefinition: EnginePing_Tool,
                handler: () => (0, handleEngineLifecycle_1.handleCustomizingEnginePing)(this.context),
            },
            {
                toolDefinition: EngineSelftest_Tool,
                handler: (a) => (0, handleEngineLifecycle_1.handleCustomizingEngineSelftest)(this.context, a),
            },
            {
                toolDefinition: EngineCleanup_Tool,
                handler: (a) => (0, handleEngineLifecycle_1.handleCustomizingEngineCleanup)(this.context, a),
            },
            {
                toolDefinition: HanaMemoryReport_Tool,
                handler: () => (0, handleMemoryReport_1.handleHanaMemoryReport)(this.context),
            },
            {
                toolDefinition: AbapMemoryReport_Tool,
                handler: () => (0, handleMemoryReport_1.handleAbapMemoryReport)(this.context),
            },
        ];
    }
}
exports.CustomizingHandlersGroup = CustomizingHandlersGroup;
//# sourceMappingURL=CustomizingHandlersGroup.js.map