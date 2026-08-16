/**
 * OrgCopy — headless copy (or delete) of an organizational unit and its
 * EC01-style dependent customizing, via the engine's org_copy op (ECOP
 * entity copier in the dark).
 *
 * Ported from abap-config-mcp. Requires the ECOP entity copier available on the
 * box (S/4HANA org-unit domains); the engine ping reports HAS_ORG_COPY.
 */
import { type EngineResponse } from '../../../lib/customizing/engineClient';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "OrgCopy";
    readonly available_in: readonly ["onprem"];
    readonly description: "[customizing] Headless copy of an organizational unit (company code, plant, sales org, …) and its dependent customizing — the \"org units in the dark\" copier (EC01-style). Records on a Customizing transport the governed way. DRY RUN by default; commit: true applies.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly org_unit: {
                readonly type: "string";
                readonly enum: readonly ["BUKRS", "WERKS", "CACCD", "VKORG", "VTWEG", "SPART", "VSTEL", "LGNUM", "EKORG", "LGORT", "MTART"];
                readonly description: "Org-unit type/domain to copy (BUKRS = company code, WERKS = plant, …).";
            };
            readonly source_key: {
                readonly type: "string";
                readonly description: "Source org-unit value.";
            };
            readonly target_key: {
                readonly type: "string";
                readonly description: "Target org-unit value (must not exist for copy).";
            };
            readonly action: {
                readonly type: "string";
                readonly enum: readonly ["COPY", "DELE"];
                readonly description: "COPY (default) or DELE.";
                readonly default: "COPY";
            };
            readonly commit: {
                readonly type: "boolean";
                readonly description: "Apply (false = dry run).";
                readonly default: false;
            };
            readonly transport: {
                readonly type: "string";
                readonly description: "Customizing transport request or task.";
            };
            readonly create_transport: {
                readonly type: "boolean";
                readonly description: "Engine creates + names its own request.";
                readonly default: false;
            };
            readonly no_transport: {
                readonly type: "boolean";
                readonly description: "Copy WITHOUT a transport request (skips transport governance; engine routes by client capability — non-recording client → no transport recording). Dev/test only.";
                readonly default: false;
            };
            readonly auto_deploy: {
                readonly type: "boolean";
                readonly description: "Redeploy the engine if missing or stale before copying (default true).";
                readonly default: true;
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "ABAP package used only when auto_deploy redeploys (default $TMP).";
                readonly default: "$TMP";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request used only when auto_deploy redeploys (for transportable packages).";
            };
        };
        readonly required: readonly ["org_unit", "source_key", "target_key"];
    };
};
interface OrgCopyArgs {
    org_unit: string;
    source_key: string;
    target_key: string;
    action?: 'COPY' | 'DELE';
    commit?: boolean;
    transport?: string;
    create_transport?: boolean;
    no_transport?: boolean;
    auto_deploy?: boolean;
    package_name?: string;
    transport_request?: string;
}
export declare function handleOrgCopy(context: HandlerContext, args: OrgCopyArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string | undefined;
    }[];
}>;
export type { EngineResponse };
//# sourceMappingURL=handleOrgCopy.d.ts.map