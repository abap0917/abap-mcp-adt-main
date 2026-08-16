/**
 * resolveAdtUri — powerup-local URI resolver for ABAP objects used by
 * activation / where-used / object-ref flows.
 *
 * Why this exists
 * ---------------
 * adt-clients v3.10.2's `buildObjectUri` (utils/activationUtils.js) is not
 * re-exported from the package's top-level entry, and in any case it doesn't
 * cover some object types we ship handlers for — most notably `PROG/I`
 * (stand-alone include programs) and `FUGR/I` (function-group includes).
 * For missing types its default fallback builds an invalid URI like
 * `/sap/bc/adt/prog/i/{name}` which SAP rejects with 404.
 *
 * This helper owns the URI mapping for the object types powerup's
 * high-level activation flow actually reaches. Callers are free to pass an
 * explicit `uri` — that always wins. The local map is only consulted when
 * the caller left `uri` blank.
 */
export interface ResolveUriArgs {
    name: string;
    type?: string;
    /** Explicit URI supplied by the caller. If present, it wins. */
    uri?: string;
    /** Parent name (function group for FUGR/FF and FUGR/I). */
    parentName?: string;
}
/**
 * Resolve the canonical ADT URI for an object. Explicit `uri` input wins.
 *
 * The local table covers every object type that powerup's activation path
 * may have to encode. If a new type surfaces, add it here rather than
 * relying on a name-heuristic fallback.
 */
export declare function resolveAdtUri(args: ResolveUriArgs): string;
//# sourceMappingURL=resolveAdtUri.d.ts.map