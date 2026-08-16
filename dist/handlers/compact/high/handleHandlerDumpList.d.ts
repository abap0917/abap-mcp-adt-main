import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "HandlerDumpList";
    readonly available_in: readonly ["onprem"];
    readonly description: "Runtime dump list. object_type: not used. Required: none. Optional: user, inlinecount, top, skip, orderby. Response: JSON.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly user: {
                readonly type: "string";
                readonly description: "Filter dumps by user.";
            };
            readonly inlinecount: {
                readonly type: "string";
                readonly enum: readonly ["allpages", "none"];
                readonly description: "Include total count in response.";
            };
            readonly top: {
                readonly type: "number";
                readonly description: "Limit number of returned dumps.";
            };
            readonly skip: {
                readonly type: "number";
                readonly description: "Offset for pagination.";
            };
            readonly orderby: {
                readonly type: "string";
                readonly description: "Sort expression.";
            };
        };
        readonly required: readonly [];
    };
};
type HandlerDumpListArgs = {
    user?: string;
    inlinecount?: 'allpages' | 'none';
    top?: number;
    skip?: number;
    orderby?: string;
};
export declare function handleHandlerDumpList(context: HandlerContext, args: HandlerDumpListArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleHandlerDumpList.d.ts.map