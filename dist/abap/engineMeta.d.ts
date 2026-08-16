/**
 * In-system Customizing/DIAG engine metadata + ABAP source loader.
 *
 * Ported from abap-config-mcp (MIT, Geert Steyaert / netweaver1970) into
 * mcp-abap-adt. The ABAP bodies live as plain .abap files next to this module
 * and are read at call time — an ABAP-only change needs no rebuild, just a
 * re-run of CustomizingEngineBootstrap.
 */
export declare const ENGINE_VERSION = "0.9.21";
export declare const ENGINE_CLASS_NAME = "ZCL_MCP_CUST_ENGINE";
export declare const ENGINE_CLASS_URL: string;
/** Default SICF path the cust-engine handler is expected to be registered under. */
export declare const ENGINE_ICF_PATH = "/sap/bc/zmcp_cust";
export declare const WRITER_REPORT_NAME = "ZMCP_CUST_WRITE";
export declare const WRITER_REPORT_URL: string;
export declare const DIAG_CLASS_NAME = "ZCL_MCP_DIAG";
export declare const DIAG_CLASS_URL: string;
export declare const DIAG_ICF_PATH = "/sap/bc/zmcp_diag";
/** Read a .abap file by base name (no extension) from the first dir that has it. */
export declare function readAbap(baseName: string): string;
/** Substitute {{KEY}} placeholders with the given values. */
export declare function applyPlaceholders(src: string, vars: Record<string, string>): string;
/**
 * IMPORT FROM DATABASE requires the cluster AREA to be a 2-char *literal* (not a
 * variable), so handle_img_index_read branches per language exactly like
 * SAPLSHI10's STREE_UPDATE_SEARCH_TEXT_INDEX: D=01, E=02, A=03, B=04, C=05,
 * F=06 … digits 0-9 = 27-36, lowercase d,e,a,b,c,f… = 37-62.
 */
export declare function hsrchAreaCases(): string;
/** The cust-engine class source with version + HSRCH CASE substituted in. */
export declare function getEngineSource(): string;
/** The background writer report source. */
export declare function getWriterSource(): string;
/** The Tier-0 diagnostic engine source. */
export declare function getDiagSource(): string;
//# sourceMappingURL=engineMeta.d.ts.map