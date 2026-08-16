import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "RuntimeGetDumpById";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[runtime] Read a specific ABAP runtime dump by dump ID. Returns parsed JSON payload. Use response_mode=\"both\" or \"summary\" to also include a compact key-facts summary (title, exception, program, line, user, date...).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly dump_id: {
                readonly type: "string";
                readonly description: "Runtime dump ID (for example: 694AB694097211F1929806D06D234D38).";
            };
            readonly view: {
                readonly type: "string";
                readonly enum: readonly ["default", "summary", "formatted"];
                readonly description: "Dump view mode: default payload, summary section, or formatted long text.";
                readonly default: "default";
            };
            readonly response_mode: {
                readonly type: "string";
                readonly enum: readonly ["payload", "summary", "both"];
                readonly description: "Controls what is returned: \"payload\" (default, legacy) — full parsed dump data only, \"summary\" — compact key facts only (title, exception, program, line, user, date...), \"both\" — summary + full payload.";
                readonly default: "payload";
            };
        };
        readonly required: readonly ["dump_id"];
    };
};
interface RuntimeGetDumpByIdArgs {
    dump_id: string;
    view?: 'default' | 'summary' | 'formatted';
    response_mode?: 'payload' | 'summary' | 'both';
}
export declare function handleRuntimeGetDumpById(context: HandlerContext, args: RuntimeGetDumpByIdArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleRuntimeGetDumpById.d.ts.map