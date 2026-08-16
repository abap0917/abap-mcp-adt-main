/**
 * Customizing write tools:
 *   CustomizingApply  — copy or delete config the SM30-standard way through the
 *     engine (VIEW_MAINTENANCE_SINGLE_ENTRY) with governed transport recording.
 *   CustomizingCreate — write explicit rows through the engine.
 *   CustomizingStatus — poll an async engine commit by run_id.
 *
 * Ported from abap-config-mcp. DRY RUN by default — commit: true applies.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
interface ApplyArgs {
    object_name: string;
    key_field: string;
    source_key: string;
    target_key: string;
    action?: 'copy' | 'delete';
    commit?: boolean;
    only_missing?: boolean;
    values?: Array<{
        field: string;
        value: string;
    }>;
    transport?: string;
    create_transport?: boolean;
    show_all_transports?: boolean;
    no_transport?: boolean;
    auto_deploy?: boolean;
    package_name?: string;
    transport_request?: string;
}
interface CreateArgs {
    object_name: string;
    rows: Array<Array<{
        field: string;
        value: string;
    }>>;
    commit?: boolean;
    transport?: string;
    create_transport?: boolean;
    auto_deploy?: boolean;
    package_name?: string;
    transport_request?: string;
}
export declare function handleCustomizingApply(context: HandlerContext, args: ApplyArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string | undefined;
    }[];
}>;
export declare function handleCustomizingCreate(context: HandlerContext, args: CreateArgs): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string | undefined;
    }[];
}>;
export declare function handleCustomizingStatus(context: HandlerContext, args: {
    run_id: string;
}): Promise<{
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const TOOL_DEFINITIONS: ({
    readonly name: "CustomizingApply";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Copy (or delete) customizing rows from sourceKey to targetKey through the SM30 maintenance-view runtime (foreign-key checks, change documents, governed transport recording — exactly like a manual SPRO change). DRY RUN by default; commit: true applies.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view or base table, e.g. V_T001 / T001.";
            };
            readonly key_field: {
                readonly type: "string";
                readonly description: "Org-unit key field, e.g. BUKRS.";
            };
            readonly source_key: {
                readonly type: "string";
                readonly description: "Source org-unit value.";
            };
            readonly target_key: {
                readonly type: "string";
                readonly description: "Target org-unit value (for action delete: the key to delete).";
            };
            readonly action: {
                readonly type: "string";
                readonly enum: readonly ["copy", "delete"];
                readonly description: "copy (default) or delete.";
                readonly default: "copy";
            };
            readonly commit: {
                readonly type: "boolean";
                readonly description: "Apply the change (false = dry run, default).";
                readonly default: false;
            };
            readonly only_missing: {
                readonly type: "boolean";
                readonly description: "copy: skip keys already present in target (default true).";
                readonly default: true;
            };
            readonly values: {
                readonly type: "array";
                readonly description: "Optional [{field, value}] overrides applied to every copied row.";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly field: {
                            readonly type: "string";
                        };
                        readonly value: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["field", "value"];
                };
            };
            readonly transport: {
                readonly type: "string";
                readonly description: "Customizing transport request or task (W function). If omitted and create_transport is false, an interactive prompt is returned instead of writing.";
            };
            readonly create_transport: {
                readonly type: "boolean";
                readonly description: "Let the engine create a new Customizing request.";
                readonly default: false;
            };
            readonly show_all_transports: {
                readonly type: "boolean";
                readonly description: "Include every user's open requests in the prompt.";
                readonly default: false;
            };
            readonly no_transport: {
                readonly type: "boolean";
                readonly description: "Write WITHOUT a transport request (skips transport governance; the engine routes by client capability — on a non-recording client like this one, changes go through the SM30 view runtime without transport recording). Use only for dev/test or when SCC4 does not record customizing changes.";
                readonly default: false;
            };
            readonly auto_deploy: {
                readonly type: "boolean";
                readonly description: "Redeploy the engine if missing or stale before writing (default true).";
                readonly default: true;
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "ABAP package used only when auto_deploy redeploys (default $TMP).";
                readonly default: "$TMP";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request used only when auto_deploy redeploys (for transportable packages).";
            };
        };
        readonly required: readonly ["object_name", "key_field", "source_key", "target_key"];
    };
} | {
    readonly name: "CustomizingCreate";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Write explicit customizing rows through the engine (SM30 view runtime). DRY RUN by default; commit: true applies. Rows are [{field, value}, …] per row.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly object_name: {
                readonly type: "string";
                readonly description: "Maintenance view or base table.";
            };
            readonly rows: {
                readonly type: "array";
                readonly description: "Explicit rows; each row is an array of {field, value} (full key + data).";
                readonly items: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly field: {
                                readonly type: "string";
                            };
                            readonly value: {
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["field", "value"];
                    };
                };
            };
            readonly commit: {
                readonly type: "boolean";
                readonly description: "Apply (false = dry run).";
                readonly default: false;
            };
            readonly transport: {
                readonly type: "string";
                readonly description: "Customizing transport request or task.";
            };
            readonly create_transport: {
                readonly type: "boolean";
                readonly description: "Engine creates a new Customizing request.";
                readonly default: false;
            };
            readonly auto_deploy: {
                readonly type: "boolean";
                readonly description: "Redeploy the engine if missing or stale before writing (default true).";
                readonly default: true;
            };
            readonly package_name: {
                readonly type: "string";
                readonly description: "ABAP package used only when auto_deploy redeploys (default $TMP).";
                readonly default: "$TMP";
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request used only when auto_deploy redeploys (for transportable packages).";
            };
        };
        readonly required: readonly ["object_name", "rows"];
    };
} | {
    readonly name: "CustomizingStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[customizing] Poll the result of an async customizing commit/delete by its run_id (returned by CustomizingApply / CustomizingCreate / OrgCopy when a commit is still pending).";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly run_id: {
                readonly type: "string";
                readonly description: "22-char run id returned by a pending write.";
            };
        };
        readonly required: readonly ["run_id"];
    };
})[];
export {};
//# sourceMappingURL=handleCustomizingWrite.d.ts.map