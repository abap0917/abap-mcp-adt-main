/**
 * UpdateMetadataExtension Handler - ABAP Metadata Extension Update via ADT API
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateMetadataExtension";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Update source code of an ABAP Metadata Extension (DDLX). Modifies Fiori UI annotations, field labels, search help, and list/object page layout for CDS views.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly name: {
                readonly type: "string";
                readonly description: "Metadata Extension name";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "New source code";
            };
            readonly lock_handle: {
                readonly type: "string";
                readonly description: "Lock handle from LockObject. If not provided, will attempt to lock internally.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number (required for transportable packages).";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: true";
            };
        };
        readonly required: readonly ["name", "source_code"];
    };
};
export declare function handleUpdateMetadataExtension(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateMetadataExtension.d.ts.map