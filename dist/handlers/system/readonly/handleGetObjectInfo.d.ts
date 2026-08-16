import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetObjectInfo";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Return ABAP object tree structure for packages (DEVC), classes (CLAS), programs (PROG), function groups (FUGR), and other objects. Shows root, group nodes, and terminal leaves up to maxDepth. Enrich each node with description and package via SearchObject if enrich=true.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly parent_type: {
                readonly type: "string";
                readonly description: "[read-only] Parent object type (e.g. DEVC/K, CLAS/OC, PROG/P)";
            };
            readonly parent_name: {
                readonly type: "string";
                readonly description: "[read-only] Parent object name";
            };
            readonly maxDepth: {
                readonly type: "integer";
                readonly description: "[read-only] Maximum tree depth (default depends on type)";
                readonly default: 1;
            };
            readonly enrich: {
                readonly type: "boolean";
                readonly description: "[read-only] Whether to add description and package via SearchObject (default true)";
                readonly default: true;
            };
        };
        readonly required: readonly ["parent_type", "parent_name"];
    };
};
export declare function handleGetObjectInfo(context: HandlerContext, args: {
    parent_type: string;
    parent_name: string;
    maxDepth?: number;
    enrich?: boolean;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        json: any;
    }[];
} | {
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
//# sourceMappingURL=handleGetObjectInfo.d.ts.map