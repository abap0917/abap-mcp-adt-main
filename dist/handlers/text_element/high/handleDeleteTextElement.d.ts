/**
 * DeleteTextElement Handler (High-level) - Remove a text element row
 *
 * Lock → READ text pool → drop matching row(s) → WRITE back → unlock
 * → optional activate. Supports "*" to wipe a whole text_type (or the
 * entire text pool when text_type is also "*").
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "DeleteTextElement";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Delete a text element from an ABAP program text pool. key=\"*\" wipes all rows of the given text_type; text_type=\"*\" wipes the whole pool.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly text_type: {
                readonly type: "string";
                readonly description: "\"I\"|\"S\"|\"R\"|\"H\", or \"*\" to wipe every row in the language.";
                readonly enum: readonly ["I", "S", "R", "H", "*"];
            };
            readonly key: {
                readonly type: "string";
                readonly description: "Row key, or \"*\" to delete every row of the given text_type.";
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
        readonly required: readonly ["program_name", "text_type"];
    };
};
export declare function handleDeleteTextElement(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleDeleteTextElement.d.ts.map