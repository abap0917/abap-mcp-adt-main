import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadDataElement";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Read ABAP data element definition and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly data_element_name: {
                readonly type: "string";
                readonly description: "Data element name (e.g., Z_MY_DATA_ELEMENT).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["data_element_name"];
    };
};
export declare function handleReadDataElement(context: HandlerContext, args: {
    data_element_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadDataElement.d.ts.map