/**
 * GetInactiveObjects Handler - Retrieve list of inactive ABAP objects
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetInactiveObjects";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Get a list of inactive ABAP objects — modified but not yet activated, pending activation. Shows classes, tables, CDS views, and other objects awaiting activation.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {};
        readonly required: readonly [];
    };
};
export declare function handleGetInactiveObjects(context: HandlerContext, _params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetInactiveObjects.d.ts.map