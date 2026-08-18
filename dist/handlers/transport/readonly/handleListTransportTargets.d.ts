/**
 * ListTransportTargets — discover the transport targets this system uses
 * (distinct E070.TARSYSTEM) and the default CreateTransport would pick.
 * Read-only.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ListTransportTargets";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[transport] List the transport target systems used by this SAP system (distinct E070.TARSYSTEM) and the default target CreateTransport auto-selects. Read-only.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
    };
};
export declare function handleListTransportTargets(context: HandlerContext): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=handleListTransportTargets.d.ts.map