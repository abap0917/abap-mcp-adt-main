/**
 * Normalize dynpro_data JSON keys for ABAP /ui2/cl_json=>deserialize compatibility.
 *
 * ABAP deserializes JSON keys by matching them to structure field names in UPPERCASE.
 * When callers pass lowercase or mixed-case keys (e.g., "metadata", "flow_logic"),
 * ABAP silently ignores them, causing HEADER-PROGRAM to be empty → TRDIR lookup
 * fails → RPY_DYNPRO_INSERT returns subrc=3.
 *
 * This function normalizes:
 *   - Top-level keys: metadata→HEADER, containers→CONTAINERS, etc.
 *   - HEADER sub-keys: all uppercased
 *   - FLOW_LOGIC: string with newlines → [{LINE:"..."}] array
 *   - Ensures HEADER.PROGRAM and HEADER.SCREEN are set from caller context
 */
/**
 * Normalize dynpro_data JSON for ABAP compatibility.
 *
 * @param dynproDataStr - Raw JSON string from caller (may have lowercase keys)
 * @param programName - Uppercase program name (fallback for HEADER.PROGRAM)
 * @param screenNumber - Screen number (fallback for HEADER.SCREEN)
 * @returns Normalized JSON string ready for ZMCP_ADT_DISPATCH
 */
export declare function normalizeDynproData(dynproDataStr: string, programName: string, screenNumber: string): string;
//# sourceMappingURL=normalizeDynproData.d.ts.map