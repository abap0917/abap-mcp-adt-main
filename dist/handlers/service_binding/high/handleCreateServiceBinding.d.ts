import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { type ServiceBindingResponseFormat } from './serviceBindingPayloadUtils';
type ServiceBindingTypeInput = 'ODataV2' | 'ODataV4';
export declare const TOOL_DEFINITION: {
    readonly name: "CreateServiceBinding";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Create ABAP service binding via ADT Business Services endpoint. XML is generated from high-level parameters.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly service_binding_name: {
                readonly type: "string";
                readonly description: "Service binding name.";
            };
            readonly service_definition_name: {
                readonly type: "string";
                readonly description: "Referenced service definition name.";
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "ABAP package name.";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Optional description. Defaults to service_binding_name when omitted.";
            };
            readonly binding_type: {
                readonly type: "string";
                readonly enum: readonly ["ODataV2", "ODataV4"];
                readonly description: "OData binding type.";
                readonly default: "ODataV4";
            };
            readonly service_binding_version: {
                readonly type: "string";
                readonly description: "Service binding ADT version. Default inferred from type.";
            };
            readonly service_name: {
                readonly type: "string";
                readonly description: "Published service name. Default: service_binding_name if omitted.";
            };
            readonly service_version: {
                readonly type: "string";
                readonly description: "Published service version. Default: 0001.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Optional transport request for transport checks.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate service binding after create. Default: true.";
                readonly default: true;
            };
            readonly response_format: {
                readonly type: "string";
                readonly enum: readonly ["xml", "json", "plain"];
                readonly default: "xml";
            };
        };
        readonly required: readonly ["service_binding_name", "service_definition_name", "package_name"];
    };
};
interface CreateServiceBindingArgs {
    service_binding_name: string;
    service_definition_name: string;
    package_name: string;
    description?: string;
    binding_type?: ServiceBindingTypeInput;
    service_binding_version?: string;
    service_name?: string;
    service_version?: string;
    transport_request?: string;
    activate?: boolean;
    response_format?: ServiceBindingResponseFormat;
}
export declare function handleCreateServiceBinding(context: HandlerContext, args: CreateServiceBindingArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleCreateServiceBinding.d.ts.map