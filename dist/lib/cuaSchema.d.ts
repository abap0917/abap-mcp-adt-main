/**
 * CUA (SAP GUI Status) schema helpers.
 *
 * SAP's RS_CUA_INTERNAL_WRITE overwrites the entire GUI status definition of
 * a program atomically — every row of every table (STA/FUN/PFK/BUT/MEN/…).
 * Missing rows and missing fields become empty. This module provides:
 *
 *   1. A typed representation (`CuaData`) that matches what
 *      /ui2/cl_json=>serialize returns for ABAP structures rsmpe_*.
 *   2. `normalizeCuaInput` — accepts either a JSON string (back-compat with
 *      the historical `cua_data: string` tool surface) or an already-parsed
 *      object, and returns a normalized `CuaData`.
 *   3. `validateCuaData` — checks required fields per table so the tool
 *      layer catches obviously-broken payloads (e.g. STA row without CODE,
 *      FUN row without FUN_TEXT) BEFORE they blow the production GUI
 *      status away. Returns the list of problems or null on success.
 *   4. `mergeCuaData` — row-level shallow merge with stable keys per table:
 *        STA  → CODE
 *        FUN  → CODE
 *        PFK  → CODE + PFNO
 *        BUT  → PFK_CODE + CODE + NO
 *        TIT  → CODE
 *        MEN  → CODE + NO
 *        MTX  → CODE
 *        ACT  → CODE + NO
 *        SET  → STATUS + FUNCTION
 *        DOC  → OBJ_TYPE + OBJ_CODE
 *        BIV  → CODE + POS  (best guess — rarely used)
 *      A row present in `changes` overwrites the matching key in `base`;
 *      any row in `base` without a match is kept. Enables Read→merge→Write
 *      semantics for PatchGuiStatus.
 */
export interface CuaAdm {
    ACTCODE?: string;
    MENCODE?: string;
    PFKCODE?: string;
    MOD_LANGU?: string;
    [k: string]: unknown;
}
export interface CuaStaRow {
    CODE: string;
    MODAL?: string;
    ACTCODE?: string;
    PFKCODE?: string;
    BUTCODE?: string;
    INT_NOTE?: string;
    [k: string]: unknown;
}
export interface CuaFunRow {
    CODE: string;
    TEXTNO?: string;
    TEXT_TYPE?: string;
    FUN_TEXT?: string;
    TEXT_NAME?: string;
    ICON_ID?: string;
    PATH?: string;
    [k: string]: unknown;
}
export interface CuaPfkRow {
    CODE: string;
    PFNO: string;
    FUNCODE: string;
    FUNNO?: string;
    [k: string]: unknown;
}
export interface CuaButRow {
    PFK_CODE: string;
    CODE: string;
    NO: string;
    PFNO: string;
    [k: string]: unknown;
}
export interface CuaTitRow {
    CODE: string;
    TEXT?: string;
    [k: string]: unknown;
}
export interface CuaData {
    ADM?: CuaAdm;
    STA?: CuaStaRow[];
    FUN?: CuaFunRow[];
    MEN?: Array<Record<string, unknown>>;
    MTX?: Array<Record<string, unknown>>;
    ACT?: Array<Record<string, unknown>>;
    BUT?: CuaButRow[];
    PFK?: CuaPfkRow[];
    SET?: Array<Record<string, unknown>>;
    DOC?: Array<Record<string, unknown>>;
    TIT?: CuaTitRow[];
    BIV?: Array<Record<string, unknown>>;
    [k: string]: unknown;
}
export declare function normalizeCuaInput(input: string | CuaData | unknown): CuaData;
export interface CuaValidationProblem {
    table: string;
    rowIndex?: number;
    field?: string;
    message: string;
}
/**
 * Per-table required-field checks that a sane caller would pass.
 * Fails early so a half-written JSON can never wipe production.
 */
export declare function validateCuaData(data: CuaData): CuaValidationProblem[];
/**
 * Row-level merge. Returns a new CuaData where every table in `changes`
 * is merged into the matching `base` table; rows in `base` without a
 * matching change are kept as-is. Fields within a matched row are shallow-
 * merged (changes win). Tables absent from `changes` keep `base`'s array.
 */
export declare function mergeCuaData(base: CuaData, changes: CuaData): CuaData;
export declare function serializeCuaForRfc(data: CuaData): string;
//# sourceMappingURL=cuaSchema.d.ts.map