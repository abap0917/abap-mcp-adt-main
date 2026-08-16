/**
 * UpdateTextElement Handler (High-level) - Modify an existing text element
 *
 * Lock program → READ text pool → replace matching row → WRITE back →
 * unlock → optional activate. Errors if the row does not exist.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateTextElement";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Update an existing text element in an ABAP program text pool. Handles lock/unlock automatically.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly text_type: {
                readonly type: "string";
                readonly description: "\"I\"|\"S\"|\"R\"|\"H\" — see GetTextElement.";
                readonly enum: readonly ["I", "S", "R", "H"];
            };
            readonly key: {
                readonly type: "string";
                readonly description: "Row key. Required except for \"R\" (single program title).";
            };
            readonly text: {
                readonly type: "string";
                readonly description: "New text content (max 132 characters).";
            };
            readonly language: {
                readonly type: "string";
                readonly description: "Language key. Defaults to SAP logon language.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate the parent program after write. Default: false.";
            };
        };
        readonly required: readonly ["program_name", "text_type", "text"];
    };
};
export declare function handleUpdateTextElement(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateTextElement.d.ts.map