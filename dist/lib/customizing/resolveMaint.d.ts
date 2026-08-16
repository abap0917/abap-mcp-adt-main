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
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
import { type SqlRow } from './runSql';
export interface ResolvedMaint {
    input: string;
    isView: boolean;
    view?: string;
    rootTable: string;
    textTable?: string;
    tables: string[];
    funcGroup?: string;
    maintType?: string;
    maintTcode?: string;
    imgActivity?: string;
    imgActivityText?: string;
    authGroup?: string;
    objectType?: string;
    cluster?: string;
    /** What VIEW_MAINTENANCE_SINGLE_ENTRY is driven on. '' ⇒ only direct write. */
    maintObject: string;
    /** Transport object the headless write actually records. */
    recordObject?: 'VDAT' | 'TABU';
    /** The official transport object as SAP/SPRO classifies it. */
    transport: {
        object: 'VDAT' | 'TABU' | 'CDAT';
        name: string;
    };
}
export declare function resolveMaint(connection: IAbapConnection, logger: ILogger | undefined, name: string): Promise<ResolvedMaint>;
/** Base-table resolution used by read/diff/plan. */
export declare function resolveBaseTable(connection: IAbapConnection, logger: ILogger | undefined, name: string): Promise<string>;
/** Load full rows for an org key from the base table. */
export declare function loadRowsFor(connection: IAbapConnection, logger: ILogger | undefined, baseTable: string, keyField: string, keyValue: string, maxRows?: number): Promise<SqlRow[]>;
//# sourceMappingURL=resolveMaint.d.ts.map