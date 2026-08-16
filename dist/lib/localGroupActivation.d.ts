/**
 * Local mass-activation helper.
 *
 * Why this exists
 * ---------------
 * adt-clients v3.10.2 exposes `AdtUtils.activateObjectsGroup(objects, preaudit)`
 * which POSTs to `/sap/bc/adt/activation/runs` and long-polls for results.
 * However its wrapper:
 *   1. Calls upstream `buildObjectUri(name, type)` internally — which has no
 *      `PROG/I` mapping (and silently builds `/sap/bc/adt/prog/i/{name}`).
 *   2. Accepts no caller-supplied explicit URI, so we can't override.
 *   3. Throws a generic "Failed to extract activation run ID" error on
 *      legacy NetWeaver < 7.50 where `/runs` is not available, hiding the
 *      need to fall back to the sync `/sap/bc/adt/activation` endpoint.
 *
 * `activateObjectsLocal()` below mirrors the upstream flow but uses
 * `resolveAdtUri` (which accepts explicit URIs and covers PROG/I + friends)
 * and falls back to the sync single-POST endpoint when the async run flow
 * is unavailable. It also returns a parsed per-object result list instead
 * of an opaque AxiosResponse.
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
export interface ActivationObjectInput {
    name: string;
    type: string;
    uri?: string;
    parent_name?: string;
}
export interface ActivationMessage {
    type: string;
    text: string;
    line?: string | number;
    column?: string | number;
    href?: string;
    objectName?: string;
    objectUri?: string;
}
export interface ActivationObjectResult {
    name: string;
    type: string;
    uri: string;
    status: 'activated' | 'failed';
    errors: ActivationMessage[];
    warnings: ActivationMessage[];
}
export interface GroupActivationResult {
    endpoint: 'runs' | 'sync';
    success: boolean;
    activated: boolean;
    checked: boolean;
    generated: boolean;
    run_id?: string;
    objects: ActivationObjectResult[];
    errors: ActivationMessage[];
    warnings: ActivationMessage[];
    raw_response?: string;
}
/**
 * Parse `<chkl:messages>` + per-object markup from an activation response
 * into structured per-object results. Handles both the run-results shape
 * (`/sap/bc/adt/activation/results/{id}`) and the sync shape
 * (`/sap/bc/adt/activation`), which differ slightly.
 */
export declare function parseActivationResults(xmlBody: string, inputObjects: Array<{
    name: string;
    type: string;
    uri: string;
}>): {
    activated: boolean;
    checked: boolean;
    generated: boolean;
    objects: ActivationObjectResult[];
    errors: ActivationMessage[];
    warnings: ActivationMessage[];
};
export interface LocalGroupActivationOptions {
    preauditRequested?: boolean;
    /** Max wait for run to finish, in ms. Default 120000 (2 minutes). */
    runTimeoutMs?: number;
    /** Polling interval while waiting for run, ms. Default 1000. */
    pollIntervalMs?: number;
}
/**
 * Activate many ABAP objects in a single request. Attempts the run-based
 * endpoint first and falls back to the sync endpoint on legacy systems.
 */
export declare function activateObjectsLocal(connection: IAbapConnection, objects: ActivationObjectInput[], options?: LocalGroupActivationOptions): Promise<GroupActivationResult>;
//# sourceMappingURL=localGroupActivation.d.ts.map