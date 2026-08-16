import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetTransaction";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] Retrieve ABAP transaction (t-code) details — program, screen, authorization object, and transaction type (dialog, report, OO).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly transaction_name: {
                readonly type: "string";
                readonly description: "Name of the ABAP transaction";
            };
        };
        readonly required: readonly ["transaction_name"];
    };
};
export declare function handleGetTransaction(context: HandlerContext, _args: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        json: {
            message: string;
        };
    }[];
}>;
//# sourceMappingURL=handleGetTransaction.d.ts.map