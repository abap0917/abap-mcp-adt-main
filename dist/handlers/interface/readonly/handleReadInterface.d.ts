import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadInterface";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[read-only] Read ABAP interface source code and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly interface_name: {
                readonly type: "string";
                readonly description: "Interface name (e.g., ZIF_MY_INTERFACE).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["interface_name"];
    };
};
export declare function handleReadInterface(context: HandlerContext, args: {
    interface_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadInterface.d.ts.map