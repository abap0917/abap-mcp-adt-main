import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadClass";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[read-only] Read ABAP class source code and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly class_name: {
                readonly type: "string";
                readonly description: "Class name (e.g., ZCL_MY_CLASS).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["class_name"];
    };
};
export declare function handleReadClass(context: HandlerContext, args: {
    class_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadClass.d.ts.map