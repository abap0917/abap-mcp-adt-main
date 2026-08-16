/**
 * In-system Customizing/DIAG engine metadata + ABAP source loader.
 *
 * Ported from abap-config-mcp (MIT, Geert Steyaert / netweaver1970) into
 * mcp-abap-adt. The ABAP bodies live as plain .abap files next to this module
 * and are read at call time — an ABAP-only change needs no rebuild, just a
 * re-run of CustomizingEngineBootstrap.
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Identity / version
// ---------------------------------------------------------------------------

export const ENGINE_VERSION = '0.9.21';
export const ENGINE_CLASS_NAME = 'ZCL_MCP_CUST_ENGINE';
export const ENGINE_CLASS_URL = `/sap/bc/adt/oo/classes/${ENGINE_CLASS_NAME.toLowerCase()}`;
/** Default SICF path the cust-engine handler is expected to be registered under. */
export const ENGINE_ICF_PATH = '/sap/bc/zmcp_cust';

export const WRITER_REPORT_NAME = 'ZMCP_CUST_WRITE';
export const WRITER_REPORT_URL = `/sap/bc/adt/programs/programs/${WRITER_REPORT_NAME.toLowerCase()}`;

export const DIAG_CLASS_NAME = 'ZCL_MCP_DIAG';
export const DIAG_CLASS_URL = `/sap/bc/adt/oo/classes/${DIAG_CLASS_NAME.toLowerCase()}`;
export const DIAG_ICF_PATH = '/sap/bc/zmcp_diag';

// ---------------------------------------------------------------------------
// .abap source loading (mirrors abap-config-mcp's loadSource.ts)
// ---------------------------------------------------------------------------

function candidateDirs(): string[] {
  const dirs = [
    process.env.ABAP_SRC_DIR,
    __dirname, // ts-node / vitest: src/abap
    path.resolve(__dirname, '../src/abap'), // src/abap -> repo/src/abap (dev)
    path.resolve(__dirname, '../../src/abap'), // dist/abap -> repo/src/abap (bundled)
    path.resolve(process.cwd(), 'src/abap'), // run from repo root
  ];
  return dirs.filter((d): d is string => Boolean(d));
}

/** Read a .abap file by base name (no extension) from the first dir that has it. */
export function readAbap(baseName: string): string {
  const file = `${baseName}.abap`;
  const tried: string[] = [];
  for (const dir of candidateDirs()) {
    const p = path.join(dir, file);
    tried.push(p);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  throw new Error(
    `ABAP source ${file} not found. Looked in:\n  ${tried.join('\n  ')}\n` +
      `Set ABAP_SRC_DIR to the directory containing the .abap files if running outside the repo.`,
  );
}

/** Substitute {{KEY}} placeholders with the given values. */
export function applyPlaceholders(
  src: string,
  vars: Record<string, string>,
): string {
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
export function hsrchAreaCases(): string {
  const order =
    'DEABCFGHIJKLMNOPQRSTUVWXYZ0123456789deabcfghijklmnopqrstuvwxyz';
  return [...order]
    .map((ch, i) => {
      const area = String(i + 1).padStart(2, '0');
      return (
        `          WHEN '${ch}'.\n` +
        `            IMPORT p_structure_texts = lt_txt p_child_structures = lt_chl\n` +
        `              FROM DATABASE indx_hsrch(${area}) ID lv_sid.\n` +
        `            lv_got = abap_true.`
      );
    })
    .join('\n');
}

/** The cust-engine class source with version + HSRCH CASE substituted in. */
export function getEngineSource(): string {
  return applyPlaceholders(readAbap('zcl_mcp_cust_engine'), {
    ENGINE_VERSION,
    HSRCH_AREA_CASES: hsrchAreaCases(),
  });
}

/** The background writer report source. */
export function getWriterSource(): string {
  return readAbap('zmcp_cust_write');
}

/** The Tier-0 diagnostic engine source. */
export function getDiagSource(): string {
  return readAbap('zcl_mcp_diag');
}
