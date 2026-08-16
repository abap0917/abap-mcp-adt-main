import type { HandlerContext } from '../../../lib/handlers/interfaces';
import { type ServiceBindingResponseFormat } from './serviceBindingPayloadUtils';
type DesiredPublicationStateInput = 'published' | 'unpublished' | 'unchanged';
type ServiceTypeInput = 'ODataV2' | 'ODataV4';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateServiceBinding";
    readonly available_in: readonly ["onprem", "cloud"];
    readonly description: "Update publication state for ABAP service binding via AdtServiceBinding workflow.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly service_binding_name: {
                readonly type: "string";
                readonly description: "Service binding name to update.";
            };
            readonly desired_publication_state: {
                readonly type: "string";
                readonly enum: readonly ["published", "unpublished", "unchanged"];
                readonly description: "Target publication state.";
            };
            readonly service_type: {
                readonly type: "string";
                readonly enum: readonly ["ODataV2", "ODataV4"];
                readonly description: "OData service type for publish/unpublish action routing.";
                readonly default: "ODataV4";
            };
            readonly service_name: {
                readonly type: "string";
                readonly description: "Published service name.";
            };
            readonly service_version: {
                readonly type: "string";
                readonly description: "Published service version. Optional.";
            };
            readonly response_format: {
                readonly type: "string";
                readonly enum: readonly ["xml", "json", "plain"];
                readonly default: "xml";
            };
        };
        readonly required: readonly ["service_binding_name", "desired_publication_state", "service_type", "service_name"];
    };
};
interface UpdateServiceBindingArgs {
    service_binding_name: string;
    desired_publication_state: DesiredPublicationStateInput;
    service_type: ServiceTypeInput;
    service_name: string;
    service_version?: string;
    response_format?: ServiceBindingResponseFormat;
}
export declare function handleUpdateServiceBinding(context: HandlerContext, args: UpdateServiceBindingArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleUpdateServiceBinding.d.ts.map