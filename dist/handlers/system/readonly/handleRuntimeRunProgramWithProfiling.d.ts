import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "RuntimeRunProgramWithProfiling";
    readonly available_in: readonly ["onprem"];
    readonly description: "[runtime] Execute ABAP program with profiler enabled and return created profilerId + traceId.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "ABAP program name to execute.";
            };
            readonly description: {
                readonly type: "string";
                readonly description: "Profiler trace description.";
            };
            readonly all_procedural_units: {
                readonly type: "boolean";
            };
            readonly all_misc_abap_statements: {
                readonly type: "boolean";
            };
            readonly all_internal_table_events: {
                readonly type: "boolean";
            };
            readonly all_dynpro_events: {
                readonly type: "boolean";
            };
            readonly aggregate: {
                readonly type: "boolean";
            };
            readonly explicit_on_off: {
                readonly type: "boolean";
            };
            readonly with_rfc_tracing: {
                readonly type: "boolean";
            };
            readonly all_system_kernel_events: {
                readonly type: "boolean";
            };
            readonly sql_trace: {
                readonly type: "boolean";
            };
            readonly all_db_events: {
                readonly type: "boolean";
            };
            readonly max_size_for_trace_file: {
                readonly type: "number";
            };
            readonly amdp_trace: {
                readonly type: "boolean";
            };
            readonly max_time_for_tracing: {
                readonly type: "number";
            };
        };
        readonly required: readonly ["program_name"];
    };
};
interface RuntimeRunProgramWithProfilingArgs {
    program_name: string;
    description?: string;
    all_procedural_units?: boolean;
    all_misc_abap_statements?: boolean;
    all_internal_table_events?: boolean;
    all_dynpro_events?: boolean;
    aggregate?: boolean;
    explicit_on_off?: boolean;
    with_rfc_tracing?: boolean;
    all_system_kernel_events?: boolean;
    sql_trace?: boolean;
    all_db_events?: boolean;
    max_size_for_trace_file?: number;
    amdp_trace?: boolean;
    max_time_for_tracing?: number;
}
export declare function handleRuntimeRunProgramWithProfiling(context: HandlerContext, args: RuntimeRunProgramWithProfilingArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleRuntimeRunProgramWithProfiling.d.ts.map