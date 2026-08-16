/**
 * PreCheck syntax check helper
 *
 * Wraps `/sap/bc/adt/checkruns` calls (and the per-type `client.getXxx().check()`
 * methods) in a single dispatcher so Create/Update handlers across every ABAP
 * source-object type can call one function instead of inlining bespoke check
 * logic.
 *
 * Dispatch rules per kind:
 * - `program` / `class` / `interface`
 *     → `client.getXxx().check({ name, sourceCode }, 'inactive')`
 *       supports true pre-write check (the proposed new source is compiled
 *       against the current environment without touching the active version).
 * - `functionModule` / `metadataExtension` / `behaviorDefinition` /
 *   `behaviorImplementation` / `serviceDefinition`
 *     → `client.getXxx().check(...)` without sourceCode — checks whatever is
 *       currently on the server. Use this AFTER a write to catch problems in
 *       the newly uploaded inactive version.
 * - `include`
 *     → no AdtClient wrapper; posts directly to
 *       `/sap/bc/adt/checkruns?reporters=abapCheckRun` with the include URI.
 *       Also a post-write check.
 * - `screen`
 *     → no dynpro-level endpoint; falls back to a program-scoped check on the
 *       parent program so flow-logic errors surface via the program's syntax
 *       check.
 *
 * All calls are wrapped with `safeCheckOperation` so ADT "already checked"
 * responses are treated as silent success.
 *
 * Callers typically:
 *   const result = await runSyntaxCheck({ connection, logger }, { kind, name, ... });
 *   assertNoCheckErrors(result, 'Include', name);   // throws with details if errors
 *   // include result.warnings in the success response
 */
import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
import { type ParsedCheckRunResult } from './checkRunParser';
type PreCheckLogger = {
    debug?: (msg: string) => void;
    info?: (msg: string) => void;
    warn?: (msg: string) => void;
    error?: (msg: string) => void;
};
export type PreCheckKind = 'program' | 'programTree' | 'programTreeInline' | 'include' | 'class' | 'interface' | 'functionModule' | 'metadataExtension' | 'behaviorDefinition' | 'behaviorImplementation' | 'serviceDefinition' | 'screen' | 'view';
export interface RunSyntaxCheckArgs {
    kind: PreCheckKind;
    /** Target object name (uppercased internally). */
    name: string;
    /**
     * Proposed new source code for pre-write checks
     * (program / class / interface only). Ignored for other kinds.
     */
    sourceCode?: string;
    /** Required when `kind === 'functionModule'`. */
    functionGroupName?: string;
    /** Required when `kind === 'screen'`. */
    parentProgramName?: string;
    /**
     * Required when `kind === 'programTreeInline'`: the ADT URI of the
     * artifact whose source is being substituted inline — e.g.
     * `/sap/bc/adt/programs/includes/zpaek_test003t/source/main`.
     */
    inlineArtifactUri?: string;
    /**
     * Required when `kind === 'programTreeInline'`: the raw source text
     * that will replace the artifact at `inlineArtifactUri` during the
     * compile. SAP base64-encodes and embeds it in the check request, so
     * nothing is written to the server.
     */
    inlineSourceCode?: string;
    /**
     * Optional override for the OUTER `<chkrun:checkObject adtcore:uri>`
     * when running a `programTreeInline` check. If omitted, the outer URI
     * is derived by stripping `/source/main` from `inlineArtifactUri`
     * (matching AdtClient's standard same-object substitution pattern).
     *
     * Set this when you want SAP to compile the PARENT program tree with
     * the inline source substituted at a CHILD URI — e.g. compiling
     * `/sap/bc/adt/programs/programs/zfoo` with the source of an include
     * `/sap/bc/adt/programs/includes/zfoo_inc1/source/main` replaced by
     * the proposed new content. This enables true program-wide multi-error
     * detection for include updates.
     */
    parentObjectUri?: string;
}
/**
 * PreCheck syntax check dispatcher.
 * Returns a ParsedCheckRunResult; throws only on transport/unknown errors.
 * "Already checked" responses are normalised to an empty-success result.
 */
export declare function runSyntaxCheck(context: {
    connection: IAbapConnection;
    logger?: PreCheckLogger;
}, args: RunSyntaxCheckArgs): Promise<ParsedCheckRunResult>;
export declare function assertNoCheckErrors(result: ParsedCheckRunResult, kind: string, name: string): void;
export {};
//# sourceMappingURL=preCheckBeforeActivation.d.ts.map