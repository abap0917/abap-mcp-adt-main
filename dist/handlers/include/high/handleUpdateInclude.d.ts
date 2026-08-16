/**
 * UpdateInclude Handler - Update ABAP Include Source Code
 *
 * Uses direct ADT REST API since AdtClient doesn't have include methods.
 * ADT endpoint: /sap/bc/adt/programs/includes/{name}
 * Workflow: lock -> update source -> unlock -> (activate)
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateInclude";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "Update source code of an existing ABAP Include program (Type I). Locks the include, uploads new source code, and unlocks. Optionally activates after update. Use this instead of UpdateProgram for Type I include programs.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly include_name: {
                readonly type: "string";
                readonly description: "Include program name. Must already exist as Type I include in SAP.";
            };
            readonly source_code: {
                readonly type: "string";
                readonly description: "Complete ABAP include source code. Do NOT include a REPORT statement — include programs start directly with code or comments.";
            };
            readonly main_program: {
                readonly type: "string";
                readonly description: "Name of the parent/master program that contains this include. When provided, a program-wide syntax check is run after the source is uploaded to catch ABAP errors in the new include code. Highly recommended.";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number. Required for transportable packages.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate include after source update. Default: false. Set to true to activate immediately.";
            };
        };
        readonly required: readonly ["include_name", "source_code"];
    };
};
export declare function handleUpdateInclude(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateInclude.d.ts.map