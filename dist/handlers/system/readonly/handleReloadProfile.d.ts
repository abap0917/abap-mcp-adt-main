/**
 * ReloadProfile Handler — reload the active profile and reset the SAP connection.
 *
 * Reads `<cwd>/.sc4sap/active-profile.txt`, loads the referenced profile env
 * from `~/.sc4sap/profiles/<alias>/sap.env`, overwrites `process.env.SAP_*`,
 * invalidates the cached connection, and returns metadata about the newly
 * active profile. The next tool call rebuilds the ABAP connection from the
 * fresh env automatically via the existing `notifyConnectionResetListeners`
 * fan-out.
 *
 * This tool is always allowed regardless of tier (handled in readonlyGuard).
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReloadProfile";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[system] Reload the active SAP profile from .sc4sap/active-profile.txt and reset the cached connection. Called by the sc4sap plugin after switching profiles. Returns the newly active alias, host, tier, and readonly status.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
        readonly required: readonly [];
    };
};
export declare function handleReloadProfile(context: HandlerContext, _args: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReloadProfile.d.ts.map