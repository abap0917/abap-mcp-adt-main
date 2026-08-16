"use strict";
/**
 * In-system Customizing/DIAG engine metadata + ABAP source loader.
 *
 * Ported from abap-config-mcp (MIT, Geert Steyaert / netweaver1970) into
 * mcp-abap-adt. The ABAP bodies live as plain .abap files next to this module
 * and are read at call time — an ABAP-only change needs no rebuild, just a
 * re-run of CustomizingEngineBootstrap.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIAG_ICF_PATH = exports.DIAG_CLASS_URL = exports.DIAG_CLASS_NAME = exports.WRITER_REPORT_URL = exports.WRITER_REPORT_NAME = exports.ENGINE_ICF_PATH = exports.ENGINE_CLASS_URL = exports.ENGINE_CLASS_NAME = exports.ENGINE_VERSION = void 0;
exports.readAbap = readAbap;
exports.applyPlaceholders = applyPlaceholders;
exports.hsrchAreaCases = hsrchAreaCases;
exports.getEngineSource = getEngineSource;
exports.getWriterSource = getWriterSource;
exports.getDiagSource = getDiagSource;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ---------------------------------------------------------------------------
// Identity / version
// ---------------------------------------------------------------------------
exports.ENGINE_VERSION = '0.9.21';
exports.ENGINE_CLASS_NAME = 'ZCL_MCP_CUST_ENGINE';
exports.ENGINE_CLASS_URL = `/sap/bc/adt/oo/classes/${exports.ENGINE_CLASS_NAME.toLowerCase()}`;
/** Default SICF path the cust-engine handler is expected to be registered under. */
exports.ENGINE_ICF_PATH = '/sap/bc/zmcp_cust';
exports.WRITER_REPORT_NAME = 'ZMCP_CUST_WRITE';
exports.WRITER_REPORT_URL = `/sap/bc/adt/programs/programs/${exports.WRITER_REPORT_NAME.toLowerCase()}`;
exports.DIAG_CLASS_NAME = 'ZCL_MCP_DIAG';
exports.DIAG_CLASS_URL = `/sap/bc/adt/oo/classes/${exports.DIAG_CLASS_NAME.toLowerCase()}`;
exports.DIAG_ICF_PATH = '/sap/bc/zmcp_diag';
// ---------------------------------------------------------------------------
// .abap source loading (mirrors abap-config-mcp's loadSource.ts)
// ---------------------------------------------------------------------------
function candidateDirs() {
    const dirs = [
        process.env.ABAP_SRC_DIR,
        __dirname, // ts-node / vitest: src/abap
        path.resolve(__dirname, '../src/abap'), // src/abap -> repo/src/abap (dev)
        path.resolve(__dirname, '../../src/abap'), // dist/abap -> repo/src/abap (bundled)
        path.resolve(process.cwd(), 'src/abap'), // run from repo root
    ];
    return dirs.filter((d) => Boolean(d));
}
/** Read a .abap file by base name (no extension) from the first dir that has it. */
function readAbap(baseName) {
    const file = `${baseName}.abap`;
    const tried = [];
    for (const dir of candidateDirs()) {
        const p = path.join(dir, file);
        tried.push(p);
        if (fs.existsSync(p))
            return fs.readFileSync(p, 'utf8');
    }
    throw new Error(`ABAP source ${file} not found. Looked in:\n  ${tried.join('\n  ')}\n` +
        `Set ABAP_SRC_DIR to the directory containing the .abap files if running outside the repo.`);
}
/** Substitute {{KEY}} placeholders with the given values. */
function applyPlaceholders(src, vars) {
    let out = src;
    for (const [key, val] of Object.entries(vars)) {
        out = out.split(`{{${key}}}`).join(val);
    }
    return out;
}
// ---------------------------------------------------------------------------
// HSRCH area-CASE generation (IMG search-text index areas, 62 languages)
// ---------------------------------------------------------------------------
/**
 * IMPORT FROM DATABASE requires the cluster AREA to be a 2-char *literal* (not a
 * variable), so handle_img_index_read branches per language exactly like
 * SAPLSHI10's STREE_UPDATE_SEARCH_TEXT_INDEX: D=01, E=02, A=03, B=04, C=05,
 * F=06 … digits 0-9 = 27-36, lowercase d,e,a,b,c,f… = 37-62.
 */
function hsrchAreaCases() {
    const order = 'DEABCFGHIJKLMNOPQRSTUVWXYZ0123456789deabcfghijklmnopqrstuvwxyz';
    return [...order]
        .map((ch, i) => {
        const area = String(i + 1).padStart(2, '0');
        return (`          WHEN '${ch}'.\n` +
            `            IMPORT p_structure_texts = lt_txt p_child_structures = lt_chl\n` +
            `              FROM DATABASE indx_hsrch(${area}) ID lv_sid.\n` +
            `            lv_got = abap_true.`);
    })
        .join('\n');
}
/** The cust-engine class source with version + HSRCH CASE substituted in. */
function getEngineSource() {
    return applyPlaceholders(readAbap('zcl_mcp_cust_engine'), {
        ENGINE_VERSION: exports.ENGINE_VERSION,
        HSRCH_AREA_CASES: hsrchAreaCases(),
    });
}
/** The background writer report source. */
function getWriterSource() {
    return readAbap('zmcp_cust_write');
}
/** The Tier-0 diagnostic engine source. */
function getDiagSource() {
    return readAbap('zcl_mcp_diag');
}
//# sourceMappingURL=engineMeta.js.map