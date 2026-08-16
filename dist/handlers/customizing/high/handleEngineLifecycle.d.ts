/**
 * Customizing engine lifecycle tools:
 *   CustomizingEngineBootstrap — deploy/update the ABAP engine (class + writer
 *     report + optional DIAG class) and activate, using the server's own
 *     create/write/activate tooling.
 *   CustomizingEnginePing     — version handshake + client change/transport
 *     capability + environment probe.
 *   CustomizingEngineSelftest — non-destructive engine validation
 *     (autoDeploy: true by default — redeploys if stale).
 *   CustomizingEngineCleanup  — delete the engine objects.
 *
 * Ported from abap-config-mcp. SICF node registration (/sap/bc/zmcp_cust,
 * /sap/bc/zmcp_diag) is a one-time BASIS step — see the bootstrap output.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces.js';
interface BootstrapArgs {
    package_name?: string;
    transport_request?: string;
    deploy_diag?: boolean;
}
interface SelftestArgs {
    table?: string;
    transport?: string;
    auto_deploy?: boolean;
}
interface CleanupArgs {
    remove_diag?: boolean;
}
export declare function handleCustomizingEngineBootstrap(context: HandlerContext, args: BootstrapArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleCustomizingEnginePing(context: HandlerContext): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleCustomizingEngineSelftest(context: HandlerContext, args: SelftestArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleCustomizingEngineCleanup(context: HandlerContext, args: CleanupArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const TOOL_DEFINITIONS: ({
    readonly name: "CustomizingEngineBootstrap";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Deploy/update the in-system customizing engine into SAP: class ZCL_MCP_CUST_ENGINE + writer report ZMCP_CUST_WRITE (and optionally ZCL_MCP_DIAG), then activate. SICF nodes must be registered once by BASIS (see output). Bump ENGINE_VERSION on ABAP changes for auto-deploy.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly package_name: {
                readonly type: "string";
                readonly description: "ABAP package (default $TMP; use a Z package + transport for CTS).";
                readonly default: "$TMP";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request (required for transportable packages).";
            };
            readonly deploy_diag: {
                readonly type: "boolean";
                readonly description: "Also deploy the read-only DIAG engine class (default true).";
                readonly default: true;
            };
        };
        readonly required: readonly [];
    };
} | {
    readonly name: "CustomizingEnginePing";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Ping the deployed customizing engine: version handshake, client change/transport capability (T000/SCC4) and environment probe (SID, release, S/4, org-copy availability).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
    };
} | {
    readonly name: "CustomizingEngineSelftest";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Non-destructive engine self-test (dynamic typing, sample read, TABKEY build; with a transport, simulates recording). autoDeploy (default true) redeploys the engine if the deployed version is stale.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly table: {
                readonly type: "string";
                readonly description: "Sample table (default TCURR).";
                readonly default: "TCURR";
            };
            readonly transport: {
                readonly type: "string";
                readonly description: "Optional transport request to simulate recording.";
            };
            readonly auto_deploy: {
                readonly type: "boolean";
                readonly description: "Redeploy the engine if stale (default true).";
                readonly default: true;
            };
        };
        readonly required: readonly [];
    };
} | {
    readonly name: "CustomizingEngineCleanup";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Delete the customizing engine objects (class ZCL_MCP_CUST_ENGINE, report ZMCP_CUST_WRITE, optional ZCL_MCP_DIAG). SICF nodes must be removed manually.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly remove_diag: {
                readonly type: "boolean";
                readonly description: "Also delete the DIAG class (default true).";
                readonly default: true;
            };
        };
        readonly required: readonly [];
    };
})[];
export {};
//# sourceMappingURL=handleEngineLifecycle.d.ts.map