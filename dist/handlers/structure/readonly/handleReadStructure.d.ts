import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadStructure";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Read ABAP structure definition and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly structure_name: {
                readonly type: "string";
                readonly description: "Structure name (e.g., Z_MY_STRUCTURE).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["structure_name"];
    };
};
export declare function handleReadStructure(context: HandlerContext, args: {
    structure_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadStructure.d.ts.map