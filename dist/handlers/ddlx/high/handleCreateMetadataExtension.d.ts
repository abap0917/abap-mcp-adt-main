/**
 * CreateMetadataExtension Handler - ABAP Metadata Extension Creation via ADT API
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateMetadataExtension";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create a new ABAP Metadata Extension (DDLX) in SAP system. Defines Fiori UI annotations, field labels, search help, and list/object page layout for CDS views.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Metadata Extension name";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Description";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "Package name";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after creation. Default: true";
            };
        };
        readonly required: readonly ["name", "package_name"];
    };
};
export declare function handleCreateMetadataExtension(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleCreateMetadataExtension.d.ts.map