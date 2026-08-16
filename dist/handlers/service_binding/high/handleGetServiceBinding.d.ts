import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { type ServiceBindingResponseFormat } from './serviceBindingPayloadUtils';
export declare const TOOL_DEFINITION: {
    readonly name: "GetServiceBinding";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Retrieve ABAP service binding source/metadata by name via ADT Business Services endpoint.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly service_binding_name: {
                readonly type: "string";
                readonly description: "Service binding name (for example: ZUI_MY_BINDING). Case-insensitive.";
            };
            readonly response_format: {
                readonly type: "string";
                readonly enum: readonly ["xml", "json", "plain"];
                readonly description: "Preferred response format. \"json\" requests JSON from endpoint, \"xml\" parses XML payload, \"plain\" returns raw text.";
                readonly default: "xml";
            };
        };
        readonly required: readonly ["service_binding_name"];
    };
};
interface GetServiceBindingArgs {
    service_binding_name: string;
    response_format?: ServiceBindingResponseFormat;
}
export declare function handleGetServiceBinding(context: HandlerContext, args: GetServiceBindingArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleGetServiceBinding.d.ts.map