import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "RuntimeListDumps";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[runtime] List ABAP runtime dumps with optional user filter and paging. Returns parsed JSON payload.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly user: {
                readonly type: "string";
                readonly description: "Optional username filter. If omitted, dumps for all users are returned.";
            };
            readonly inlinecount: {
                readonly type: "string";
                readonly enum: readonly ["allpages", "none"];
                readonly description: "Include total count metadata.";
            };
            readonly top: {
                readonly type: "number";
                readonly description: "Maximum number of records to return.";
            };
            readonly skip: {
                readonly type: "number";
                readonly description: "Number of records to skip.";
            };
            readonly orderby: {
                readonly type: "string";
                readonly description: "ADT order by expression.";
            };
        };
        readonly required: readonly [];
    };
};
interface RuntimeListDumpsArgs {
    user?: string;
    inlinecount?: 'allpages' | 'none';
    top?: number;
    skip?: number;
    orderby?: string;
}
export declare function handleRuntimeListDumps(context: HandlerContext, args: RuntimeListDumpsArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleRuntimeListDumps.d.ts.map