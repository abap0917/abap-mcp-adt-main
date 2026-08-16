/**
 * Customizing maintenance-object resolver.
 *
 * Ported from abap-config-mcp (MIT). Given a name that may be a maintenance
 * VIEW, a base TABLE, or an IMG activity object, resolve the full SM30/SM34
 * maintenance object from the live DDIC schema:
 *
 *   DD25L  view header        VIEWNAME, AGGTYPE ('V'=view), ROOTTAB
 *   DD26S  view member tables VIEWNAME, TABNAME, TABPOS
 *   TVDIR  maintenance dir    TABNAME, AREA(=fgrp), TYPE(1/2), BASTAB
 *   TDDAT  table auth group   TABNAME, CCLASS
 *   DD03L  LANG-typed fields  identifies the text table (SPRAS key)
 *   CUS_ACTOBJ  IMG activity  ACT_ID, OBJECTTYPE, OBJECTNAME, TCODE
 *
 * The transport object is R3TR VDAT <view> when maintained through a view (the
 * SM30/SPRO path, spanning base + text table), else R3TR TABU <table>.
 */

import type {
  IAbapConnection,
  ILogger,
} from '@babamba2/mcp-abap-adt-interfaces';
import { col, runSql, type SqlRow, sql1 } from './runSql';

export interface ResolvedMaint {
  input: string;
  isView: boolean;
  view?: string;
  rootTable: string;
  textTable?: string;
  tables: string[]; // full ordered table set (base + text + …)
  funcGroup?: string; // TVDIR AREA
  maintType?: string; // TVDIR TYPE (1 one-step / 2 two-step)
  maintTcode?: string; // CUS_ACTOBJ TCODE (SM30 / SM34 / …)
  imgActivity?: string; // CUS_ACTOBJ ACT_ID
  imgActivityText?: string; // CUS_IMGACT TEXT — the SPRO activity title
  authGroup?: string; // TDDAT CCLASS of the root table
  objectType?: string; // CUS_ACTOBJ OBJECTTYPE: V view / S table / C cluster / T txn / D dummy
  cluster?: string; // VCLSTRUC view cluster this view belongs to (if any)
  /** What VIEW_MAINTENANCE_SINGLE_ENTRY is driven on. '' ⇒ only direct write. */
  maintObject: string;
  /** Transport object the headless write actually records. */
  recordObject?: 'VDAT' | 'TABU';
  /** The official transport object as SAP/SPRO classifies it. */
  transport: { object: 'VDAT' | 'TABU' | 'CDAT'; name: string };
}

export async function resolveMaint(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  name: string,
): Promise<ResolvedMaint> {
  const obj = name.toUpperCase().replace(/'/g, "''");

  let view: string | undefined;
  let rootTable = obj;
  let tabRows: SqlRow[] = [];
  let singleTable = false; // table that is its own SM30 maintenance object

  // 1. Is the input itself a maintenance view?
  const dd25 = await sql1(
    connection,
    logger,
    `SELECT VIEWNAME, AGGTYPE, ROOTTAB FROM DD25L WHERE VIEWNAME = '${obj}'`,
  );
  if (dd25[0]) {
    view = obj;
    rootTable = col(dd25[0], 'ROOTTAB') || obj;
    tabRows = await sql1(
      connection,
      logger,
      `SELECT TABNAME, TABPOS FROM DD26S WHERE VIEWNAME = '${obj}' ORDER BY TABPOS`,
    );
  } else {
    // 2. Input is a config table — find the maintenance view(s) ROOTED on it.
    //    (Filtering DD26S by TABNAME picks wrong views; DD25L.ROOTTAB is exact.)
    const rooted = await sql1(
      connection,
      logger,
      `SELECT VIEWNAME FROM DD25L WHERE ROOTTAB = '${obj}' AND AGGTYPE = 'V'`,
    );
    const cand = [...new Set(rooted.map((r) => col(r, 'VIEWNAME')))]
      .filter((v) => v && v !== obj)
      .sort((a, b) => a.length - b.length || a.localeCompare(b)); // canonical = shortest
    if (cand.length) {
      const inList = cand
        .slice(0, 12)
        .map((v) => `'${v}'`)
        .join(',');
      const tv = await sql1(
        connection,
        logger,
        `SELECT TABNAME FROM TVDIR WHERE TABNAME IN (${inList})`,
      );
      const maintViews = new Set(tv.map((r) => col(r, 'TABNAME')));
      view = cand.find((v) => maintViews.has(v)); // shortest view with a maint dialog
      if (view) {
        const dd25v = await sql1(
          connection,
          logger,
          `SELECT ROOTTAB FROM DD25L WHERE VIEWNAME = '${view}'`,
        );
        rootTable = col(dd25v[0] ?? {}, 'ROOTTAB') || obj;
        tabRows = await sql1(
          connection,
          logger,
          `SELECT TABNAME, TABPOS FROM DD26S WHERE VIEWNAME = '${view}' ORDER BY TABPOS`,
        );
      }
    }
    // 3. No view → is the table its own single-table maintenance object?
    if (!view) {
      const selfTv = await sql1(
        connection,
        logger,
        `SELECT TABNAME, AREA, TYPE, BASTAB FROM TVDIR WHERE TABNAME = '${obj}'`,
      );
      if (selfTv[0] && col(selfTv[0], 'BASTAB') === 'X') singleTable = true;
    }
  }

  let tables = tabRows.map((r) => col(r, 'TABNAME')).filter(Boolean);
  if (tables.length === 0) tables = [rootTable];
  if (!rootTable) rootTable = tables[0];

  // Text table: a member (≠ root) carrying a LANG-typed key (SPRAS)
  let textTable: string | undefined;
  const nonRoot = tables.filter((t) => t !== rootTable);
  if (nonRoot.length) {
    const inList = nonRoot.map((t) => `'${t}'`).join(',');
    const langFields = await sql1(
      connection,
      logger,
      `SELECT TABNAME FROM DD03L WHERE TABNAME IN (${inList}) AND DATATYPE = 'LANG' AND AS4LOCAL = 'A'`,
    );
    textTable = langFields.map((r) => col(r, 'TABNAME')).find(Boolean);
  }

  const maintName = view ?? (singleTable ? obj : '');
  let funcGroup: string | undefined;
  let maintType: string | undefined;
  if (maintName) {
    const tvdir = await sql1(
      connection,
      logger,
      `SELECT AREA, TYPE FROM TVDIR WHERE TABNAME = '${maintName}'`,
    );
    funcGroup = col(tvdir[0] ?? {}, 'AREA') || undefined;
    maintType = col(tvdir[0] ?? {}, 'TYPE') || undefined;
  }

  let cluster: string | undefined;
  if (view) {
    const vcl = await sql1(
      connection,
      logger,
      `SELECT VCLNAME FROM VCLSTRUC WHERE OBJECT = '${view}'`,
    );
    cluster = col(vcl[0] ?? {}, 'VCLNAME') || undefined;
  }

  const actName = cluster ?? maintName ?? rootTable;
  const actObj = await sql1(
    connection,
    logger,
    `SELECT ACT_ID, OBJECTTYPE, OBJECTNAME, TCODE FROM CUS_ACTOBJ WHERE OBJECTNAME = '${actName}'`,
  );
  const imgActivity = col(actObj[0] ?? {}, 'ACT_ID') || undefined;
  const objectType = col(actObj[0] ?? {}, 'OBJECTTYPE') || undefined;
  const maintTcode = col(actObj[0] ?? {}, 'TCODE') || undefined;

  let imgActivityText: string | undefined;
  if (imgActivity) {
    const it = await sql1(
      connection,
      logger,
      `SELECT TEXT FROM CUS_IMGACT WHERE SPRAS = 'E' AND ACTIVITY = '${imgActivity.replace(/'/g, "''")}'`,
    );
    imgActivityText = col(it[0] ?? {}, 'TEXT') || undefined;
  }

  const tddat = await sql1(
    connection,
    logger,
    `SELECT CCLASS FROM TDDAT WHERE TABNAME = '${rootTable}'`,
  );
  const authGroup = col(tddat[0] ?? {}, 'CCLASS') || undefined;

  const maintObject = view ?? (singleTable ? obj : '');
  const recordObject: 'VDAT' | 'TABU' | undefined = view
    ? 'VDAT'
    : singleTable
      ? 'TABU'
      : undefined;
  const transport: ResolvedMaint['transport'] = cluster
    ? { object: 'CDAT', name: cluster }
    : view
      ? { object: 'VDAT', name: view }
      : { object: 'TABU', name: rootTable };

  return {
    input: obj,
    isView: !!view,
    view,
    rootTable,
    textTable,
    tables,
    funcGroup,
    maintType,
    maintTcode,
    imgActivity,
    imgActivityText,
    authGroup,
    objectType,
    cluster,
    maintObject,
    recordObject,
    transport,
  };
}

/** Base-table resolution used by read/diff/plan. */
export async function resolveBaseTable(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  name: string,
): Promise<string> {
  return (await resolveMaint(connection, logger, name)).rootTable;
}

/** Load full rows for an org key from the base table. */
export async function loadRowsFor(
  connection: IAbapConnection,
  logger: ILogger | undefined,
  baseTable: string,
  keyField: string,
  keyValue: string,
  maxRows = 500,
): Promise<SqlRow[]> {
  const sql = `SELECT * FROM ${baseTable} WHERE ${keyField} = '${keyValue.replace(/'/g, "''")}'`;
  return runSql(connection, logger, sql, maxRows);
}
