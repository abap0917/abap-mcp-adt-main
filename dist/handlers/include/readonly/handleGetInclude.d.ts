import * as z from 'zod';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetInclude";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[read-only] Retrieve source code of a specific ABAP include file.";
    readonly inputSchema: {
        readonly include_name: z.ZodString;
    };
};
export declare function handleGetInclude(context: HandlerContext, args: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetInclude.d.ts.map