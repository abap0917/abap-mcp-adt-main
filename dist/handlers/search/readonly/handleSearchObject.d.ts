import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "SearchObject";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Find, search, locate, or check if an ABAP repository object exists by name or wildcard pattern (e.g. 'ZOK*'). Use this tool to answer questions like 'is there a program named...', 'find all objects starting with...', 'does this class exist?', 'list objects matching...'. Supports all repository object types — optionally filter by type (PROG, CLAS, INTF, DEVC, TABL, DDLS, DTEL, FUGR, SRVD, SRVB, BDEF, DDLX, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "[read-only] Object name or mask (e.g. 'MARA*')";
            };
            readonly object_type: {
                readonly type: "string";
                readonly description: "[read-only] Optional ABAP object type (e.g. 'TABL', 'CLAS/OC')";
            };
            readonly maxResults: {
                readonly type: "number";
                readonly description: "[read-only] Maximum number of results to return";
                readonly default: 100;
            };
        };
        readonly required: readonly ["object_name"];
    };
};
export declare function handleSearchObject(context: HandlerContext, args: any): Promise<{
    isError: boolean;
    content: any[];
}>;
//# sourceMappingURL=handleSearchObject.d.ts.map