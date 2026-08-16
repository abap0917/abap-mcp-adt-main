import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "RuntimeAnalyzeDump";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[runtime] Read runtime dump by ID and return compact analysis summary with key fields.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly dump_id: {
                readonly type: "string";
                readonly description: "Runtime dump ID.";
            };
            readonly view: {
                readonly type: "string";
                readonly enum: readonly ["default", "summary", "formatted"];
                readonly description: "Dump view mode to analyze: default payload, summary section, or formatted long text.";
                readonly default: "default";
            };
            readonly include_payload: {
                readonly type: "boolean";
                readonly description: "Include full parsed payload in response.";
                readonly default: true;
            };
        };
        readonly required: readonly ["dump_id"];
    };
};
interface RuntimeAnalyzeDumpArgs {
    dump_id: string;
    view?: 'default' | 'summary' | 'formatted';
    include_payload?: boolean;
}
export declare function handleRuntimeAnalyzeDump(context: HandlerContext, args: RuntimeAnalyzeDumpArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleRuntimeAnalyzeDump.d.ts.map