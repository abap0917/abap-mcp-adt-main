"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMaint = resolveMaint;
exports.resolveBaseTable = resolveBaseTable;
exports.loadRowsFor = loadRowsFor;
const runSql_1 = require("./runSql");
async function resolveMaint(connection, logger, name) {
    const obj = name.toUpperCase().replace(/'/g, "''");
    let view;
    let rootTable = obj;
    let tabRows = [];
    let singleTable = false; // table that is its own SM30 maintenance object
    // 1. Is the input itself a maintenance view?
    const dd25 = await (0, runSql_1.sql1)(connection, logger, `SELECT VIEWNAME, AGGTYPE, ROOTTAB FROM DD25L WHERE VIEWNAME = '${obj}'`);
    if (dd25[0]) {
        view = obj;
        rootTable = (0, runSql_1.col)(dd25[0], 'ROOTTAB') || obj;
        tabRows = await (0, runSql_1.sql1)(connection, logger, `SELECT TABNAME, TABPOS FROM DD26S WHERE VIEWNAME = '${obj}' ORDER BY TABPOS`);
    }
    else {
        // 2. Input is a config table — find the maintenance view(s) ROOTED on it.
        //    (Filtering DD26S by TABNAME picks wrong views; DD25L.ROOTTAB is exact.)
        const rooted = await (0, runSql_1.sql1)(connection, logger, `SELECT VIEWNAME FROM DD25L WHERE ROOTTAB = '${obj}' AND AGGTYPE = 'V'`);
        const cand = [...new Set(rooted.map((r) => (0, runSql_1.col)(r, 'VIEWNAME')))]
            .filter((v) => v && v !== obj)
            .sort((a, b) => a.length - b.length || a.localeCompare(b)); // canonical = shortest
        if (cand.length) {
            const inList = cand
                .slice(0, 12)
                .map((v) => `'${v}'`)
                .join(',');
            const tv = await (0, runSql_1.sql1)(connection, logger, `SELECT TABNAME FROM TVDIR WHERE TABNAME IN (${inList})`);
            const maintViews = new Set(tv.map((r) => (0, runSql_1.col)(r, 'TABNAME')));
            view = cand.find((v) => maintViews.has(v)); // shortest view with a maint dialog
            if (view) {
                const dd25v = await (0, runSql_1.sql1)(connection, logger, `SELECT ROOTTAB FROM DD25L WHERE VIEWNAME = '${view}'`);
                rootTable = (0, runSql_1.col)(dd25v[0] ?? {}, 'ROOTTAB') || obj;
                tabRows = await (0, runSql_1.sql1)(connection, logger, `SELECT TABNAME, TABPOS FROM DD26S WHERE VIEWNAME = '${view}' ORDER BY TABPOS`);
            }
        }
        // 3. No view → is the table its own single-table maintenance object?
        if (!view) {
            const selfTv = await (0, runSql_1.sql1)(connection, logger, `SELECT TABNAME, AREA, TYPE, BASTAB FROM TVDIR WHERE TABNAME = '${obj}'`);
            if (selfTv[0] && (0, runSql_1.col)(selfTv[0], 'BASTAB') === 'X')
                singleTable = true;
        }
    }
    let tables = tabRows.map((r) => (0, runSql_1.col)(r, 'TABNAME')).filter(Boolean);
    if (tables.length === 0)
        tables = [rootTable];
    if (!rootTable)
        rootTable = tables[0];
    // Text table: a member (≠ root) carrying a LANG-typed key (SPRAS)
    let textTable;
    const nonRoot = tables.filter((t) => t !== rootTable);
    if (nonRoot.length) {
        const inList = nonRoot.map((t) => `'${t}'`).join(',');
        const langFields = await (0, runSql_1.sql1)(connection, logger, `SELECT TABNAME FROM DD03L WHERE TABNAME IN (${inList}) AND DATATYPE = 'LANG' AND AS4LOCAL = 'A'`);
        textTable = langFields.map((r) => (0, runSql_1.col)(r, 'TABNAME')).find(Boolean);
    }
    const maintName = view ?? (singleTable ? obj : '');
    let funcGroup;
    let maintType;
    if (maintName) {
        const tvdir = await (0, runSql_1.sql1)(connection, logger, `SELECT AREA, TYPE FROM TVDIR WHERE TABNAME = '${maintName}'`);
        funcGroup = (0, runSql_1.col)(tvdir[0] ?? {}, 'AREA') || undefined;
        maintType = (0, runSql_1.col)(tvdir[0] ?? {}, 'TYPE') || undefined;
    }
    let cluster;
    if (view) {
        const vcl = await (0, runSql_1.sql1)(connection, logger, `SELECT VCLNAME FROM VCLSTRUC WHERE OBJECT = '${view}'`);
        cluster = (0, runSql_1.col)(vcl[0] ?? {}, 'VCLNAME') || undefined;
    }
    const actName = cluster ?? maintName ?? rootTable;
    const actObj = await (0, runSql_1.sql1)(connection, logger, `SELECT ACT_ID, OBJECTTYPE, OBJECTNAME, TCODE FROM CUS_ACTOBJ WHERE OBJECTNAME = '${actName}'`);
    const imgActivity = (0, runSql_1.col)(actObj[0] ?? {}, 'ACT_ID') || undefined;
    const objectType = (0, runSql_1.col)(actObj[0] ?? {}, 'OBJECTTYPE') || undefined;
    const maintTcode = (0, runSql_1.col)(actObj[0] ?? {}, 'TCODE') || undefined;
    let imgActivityText;
    if (imgActivity) {
        const it = await (0, runSql_1.sql1)(connection, logger, `SELECT TEXT FROM CUS_IMGACT WHERE SPRAS = 'E' AND ACTIVITY = '${imgActivity.replace(/'/g, "''")}'`);
        imgActivityText = (0, runSql_1.col)(it[0] ?? {}, 'TEXT') || undefined;
    }
    const tddat = await (0, runSql_1.sql1)(connection, logger, `SELECT CCLASS FROM TDDAT WHERE TABNAME = '${rootTable}'`);
    const authGroup = (0, runSql_1.col)(tddat[0] ?? {}, 'CCLASS') || undefined;
    const maintObject = view ?? (singleTable ? obj : '');
    const recordObject = view
        ? 'VDAT'
        : singleTable
            ? 'TABU'
            : undefined;
    const transport = cluster
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
async function resolveBaseTable(connection, logger, name) {
    return (await resolveMaint(connection, logger, name)).rootTable;
}
/** Load full rows for an org key from the base table. */
async function loadRowsFor(connection, logger, baseTable, keyField, keyValue, maxRows = 500) {
    const sql = `SELECT * FROM ${baseTable} WHERE ${keyField} = '${keyValue.replace(/'/g, "''")}'`;
    return (0, runSql_1.runSql)(connection, logger, sql, maxRows);
}
//# sourceMappingURL=resolveMaint.js.map