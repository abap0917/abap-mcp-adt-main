/**
 * HanaMemoryReport / AbapMemoryReport — system memory diagnostics via the
 * Tier-0 diagnostic engine (ZCL_MCP_DIAG at /sap/bc/zmcp_diag).
 *
 * Ported from abap-config-mcp. Requires the DIAG engine deployed + SICF node
 * registered; read-only and safe for production.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare function handleHanaMemoryReport(context: HandlerContext): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare function handleAbapMemoryReport(context: HandlerContext): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const TOOL_DEFINITIONS: ({
    readonly name: "HanaMemoryReport";
    readonly available_in: readonly ["onprem"];
    readonly description: "[runtime] HANA memory report (host / service / heap / column-store / SQL plan cache) via the deployed diagnostic engine. Read-only.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
    };
} | {
    readonly name: "AbapMemoryReport";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[runtime] ABAP work process memory report (profile parameters + live usage) via the deployed diagnostic engine. Read-only.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
    };
})[];
//# sourceMappingURL=handleMemoryReport.d.ts.map