/**
 * GetBadiImplementations — read-only BAdI implementation discovery.
 *
 * Use case: symptom analysis on standard SAP BAdIs. When an error
 * occurs in a standard transaction or BAPI that runs through a BAdI
 * (e.g. PO BAPI error → ME_PROCESS_PO_CUST), this handler returns the
 * customer (Z* and Y*) implementations registered against that BAdI def
 * — including the implementing class name — so the user can read the
 * impl source via GetClass and find the bug.
 *
 * Backend (current revision):
 *   ECC only — routes through the ZMCP_ADT_DDIC_BADI function module
 *   via the OData FunctionImport `DdicBadi`. The MCP server's ADT
 *   datapreview / ddic / enhsxsb endpoints are absent on legacy
 *   kernels (BASIS < 7.50), so the RFC bridge is the only viable
 *   path. S/4HANA path is planned but not implemented.
 *
 * Coverage:
 *   classic BAdI (SE18/SE19): full
 *   kernel BAdI (SE20): NOT covered — returns kind='unknown'
 *
 * Companion ABAP source: sc4sap/abap/zmcp_adt_ddic_badi_ecc.abap
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "GetBadiImplementations";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "[read-only] Find implementations of a (classic) BAdI definition. Use during symptom analysis when a standard SAP BAdI is implicated — answers 'which Z class extends this standard BAdI?'. Example flow: PO BAPI error → ME_PROCESS_PO_CUST → list Z impls → read the impl class source via GetClass to find the bug. Currently ECC-only (routes through the ZMCP_ADT_DDIC_BADI bridge FM). Classic BAdI only; kernel BAdI returns kind='unknown'.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly badi_definition: {
                readonly type: "string";
                readonly description: "BAdI definition name (e.g., ME_PROCESS_PO_CUST). Will be uppercased.";
            };
            readonly customer_only: {
                readonly type: "boolean";
                readonly description: "Restrict to Z*/Y* implementations. Default: true. Set false to include SAP-shipped implementations.";
                readonly default: true;
            };
            readonly active_only: {
                readonly type: "boolean";
                readonly description: "Restrict to active implementations only. Default: true.";
                readonly default: true;
            };
            readonly include_methods: {
                readonly type: "boolean";
                readonly description: "Include the list of redefined method names per implementation (from SXC_EXIT). Default: true.";
                readonly default: true;
            };
        };
        readonly required: readonly ["badi_definition"];
    };
};
export declare function handleGetBadiImplementations(context: HandlerContext, args: {
    badi_definition: string;
    customer_only?: boolean;
    active_only?: boolean;
    include_methods?: boolean;
}): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleGetBadiImplementations.d.ts.map