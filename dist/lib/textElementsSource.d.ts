/**
 * Plain-text <-> structured serializer for the three ADT textelements
 * subsources (symbols / selections / headings).
 *
 * The on-wire format was verified live against S/4HANA. Examples:
 *
 *   GET /sap/bc/adt/textelements/programs/{prog}/source/symbols
 *     @MaxLength:10
 *     001=텍스트 심볼 001
 *
 *     @MaxLength:15
 *     042=Text Symbol 042
 *
 *   GET /sap/bc/adt/textelements/programs/{prog}/source/selections
 *     P_DATE  =처리일자
 *
 *     SO_CARRI=Carrier ID
 *
 *   GET /sap/bc/adt/textelements/programs/{prog}/source/headings
 *     listHeader=<free-form>
 *
 *     columnHeader_1=<text>
 *     columnHeader_2=<text>
 *     ...
 *
 * All subsources use CRLF line endings and blank-line record separators.
 * Selections pad keys to 8 characters. Symbols prefix each record with a
 * `@MaxLength:N` annotation.
 */
export interface SymbolEntry {
    /** 3-char text symbol key (e.g. "001"). Case-preserved. */
    key: string;
    /** Text content (bounded by maxLength). */
    text: string;
    /** Optional max-length annotation. Defaults to 40 if omitted. */
    maxLength?: number;
}
export interface SelectionEntry {
    /** Parameter / select-option name (uppercase, will be padded to 8). */
    key: string;
    /** Selection text shown in the selection screen. */
    text: string;
}
export interface HeadingEntry {
    /**
     * Either the literal 'listHeader' or 'columnHeader_N' for some N.
     * Arbitrary keys are rejected by the serializer because SAP only
     * accepts this fixed key set for the headings subsource.
     */
    key: string;
    text: string;
}
export declare function parseSymbolsSource(body: string): SymbolEntry[];
export declare function serializeSymbolsSource(entries: SymbolEntry[]): string;
export declare function parseSelectionsSource(body: string): SelectionEntry[];
export declare function serializeSelectionsSource(entries: SelectionEntry[]): string;
export declare function parseHeadingsSource(body: string): HeadingEntry[];
/**
 * SAP rejects arbitrary keys for the headings subsource — only
 * `listHeader` and `columnHeader_N` are permitted. We surface any stray
 * key as an error so callers notice before the PUT fails 4xx.
 */
export declare function serializeHeadingsSource(entries: HeadingEntry[]): string;
/**
 * Route a mixed bag of entries into the three subsources. `type` must be
 * one of I/S/H; R is handled separately by the caller because the native
 * ADT endpoint does not cover program titles.
 */
export interface MixedTextElementEntry {
    type: 'I' | 'S' | 'H';
    key: string;
    text: string;
    max_length?: number;
}
export interface GroupedSources {
    symbols: SymbolEntry[];
    selections: SelectionEntry[];
    headings: HeadingEntry[];
}
export declare function groupBySubsource(entries: MixedTextElementEntry[]): GroupedSources;
//# sourceMappingURL=textElementsSource.d.ts.map