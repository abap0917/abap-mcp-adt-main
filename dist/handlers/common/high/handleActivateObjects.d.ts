/**
 * ActivateObjects — High-level mass activation for a set of ABAP objects.
 *
 * Hits `/sap/bc/adt/activation/runs` exactly once for the entire batch,
 * regardless of object count. Designed for scenarios where objects carry
 * cyclic references (e.g. 5 includes referencing each other's TYPES/FORMs)
 * that cannot be activated one-by-one because each individual activation
 * would fail on unresolved references to still-inactive siblings.
 *
 * Falls back to the legacy sync `/sap/bc/adt/activation` endpoint on
 * NetWeaver systems where `/runs` is unavailable.
 *
 * This is additive — the existing `ActivateObjectLow` and per-handler
 * inline activation paths are untouched.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "ActivateObjects";
    readonly available_in: readonly ["onprem", "cloud", "legacy"];
    readonly description: "[high-level] Activate a set of ABAP objects in a single call. Uses the ADT mass-activation endpoint (/sap/bc/adt/activation/runs) so cyclic references between siblings (e.g. main program + multiple cross-referencing includes) resolve in one compilation scope. Returns per-object status, errors, warnings. Falls back to /sap/bc/adt/activation on legacy systems.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly objects: {
                readonly type: "array";
                readonly minItems: 1;
                readonly description: "Objects to activate in one batch. Supply either explicit uri, or name+type (and parent_name for FUGR/FF, FUGR/I).";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly name: {
                            readonly type: "string";
                            readonly description: "Object name (will be uppercased).";
                        };
                        readonly type: {
                            readonly type: "string";
                            readonly description: "ADT object type code, e.g. 'PROG/P' (program), 'PROG/I' (include), 'CLAS/OC' (class), 'FUGR/FF' (function module).";
                        };
                        readonly uri: {
                            readonly type: "string";
                            readonly description: "Explicit ADT URI. When provided, overrides name-based URI resolution.";
                        };
                        readonly parent_name: {
                            readonly type: "string";
                            readonly description: "Parent name — required for FUGR/FF (function group) and FUGR/I (function-group include).";
                        };
                    };
                    readonly required: readonly ["name"];
                };
            };
            readonly preaudit: {
                readonly type: "boolean";
                readonly description: "Request pre-audit before activation. Default true.";
            };
            readonly run_timeout_ms: {
                readonly type: "number";
                readonly description: "Max time to wait for the activation run to finish (runs endpoint only). Default 120000.";
            };
        };
        readonly required: readonly ["objects"];
    };
};
interface ActivateObjectsArgs {
    objects: Array<{
        name: string;
        type?: string;
        uri?: string;
        parent_name?: string;
    }>;
    preaudit?: boolean;
    run_timeout_ms?: number;
}
export declare function handleActivateObjects(context: HandlerContext, args: ActivateObjectsArgs): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
export {};
//# sourceMappingURL=handleActivateObjects.d.ts.map