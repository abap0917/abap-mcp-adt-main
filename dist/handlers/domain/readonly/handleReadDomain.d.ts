import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ReadDomain";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Read ABAP domain definition and metadata (package, responsible, description, etc.).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly domain_name: {
                readonly type: "string";
                readonly description: "Domain name (e.g., Z_MY_DOMAIN).";
            };
            readonly version: {
                readonly type: "string";
                readonly enum: readonly ["active", "inactive"];
                readonly description: "Version to read: \"active\" (default) or \"inactive\".";
                readonly default: "active";
            };
        };
        readonly required: readonly ["domain_name"];
    };
};
export declare function handleReadDomain(context: HandlerContext, args: {
    domain_name: string;
    version?: 'active' | 'inactive';
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleReadDomain.d.ts.map