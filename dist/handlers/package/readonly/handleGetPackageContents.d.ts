import * as z from 'zod';
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetPackageContents";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[read-only] Retrieve objects inside an ABAP package as a flat list. Supports recursive traversal of subpackages.";
    readonly inputSchema: {
        readonly package_name: z.ZodString;
        readonly include_subpackages: z.ZodOptional<z.ZodBoolean>;
        readonly max_depth: z.ZodOptional<z.ZodNumber>;
        readonly include_descriptions: z.ZodOptional<z.ZodBoolean>;
    };
};
interface GetPackageContentsArgs {
    package_name: string;
    include_subpackages?: boolean;
    max_depth?: number;
    include_descriptions?: boolean;
    filePath?: string;
}
export declare function handleGetPackageContents(context: HandlerContext, args: GetPackageContentsArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleGetPackageContents.d.ts.map