import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadView";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[read-only] Read ABAP view (CDS view) source code and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly view_name: {
                readonly type: "string";
                readonly description: "View name (e.g., Z_MY_VIEW).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["view_name"];
    };
};
export declare function handleReadView(context: HandlerContext, args: {
    view_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadView.d.ts.map