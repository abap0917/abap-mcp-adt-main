/**
 * ListTransports Handler - List user's transport requests via ADT API
 *
 * Retrieves transport requests for the current user or specified user.
 * Uses AdtClient.getRequest().list() with proper Accept negotiation.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ListTransports";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "[read-only] List transport requests for the current or specified user. Returns modifiable and/or released workbench and customizing requests.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly user: {
                readonly type: "string";
                readonly description: "SAP user name. If not provided, returns transports for the current user.";
            };
            readonly modifiable_only: {
                readonly type: "boolean";
                readonly description: "Only return modifiable (not yet released) transports. Default: true.";
            };
        };
        readonly required: readonly [];
    };
};
interface ListTransportsArgs {
    user?: string;
    modifiable_only?: boolean;
}
export declare function handleListTransports(context: HandlerContext, args: ListTransportsArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: string;
    }[];
}>;
export {};
//# sourceMappingURL=handleListTransports.d.ts.map