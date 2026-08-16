/**
 * UpdateGuiStatus Handler (High-level) - Update ABAP GUI Status definition
 *
 * Locks program, writes CUA data via RFC, unlocks, optionally activates.
 */
import type { HandlerContext } from '../../../lib/handlers/interfaces';
export declare const TOOL_DEFINITION: {
    readonly name: "UpdateGuiStatus";
    readonly available_in: readonly ["onprem", "legacy"];
    readonly description: "⚠️ FULL REPLACE — overwrites the entire GUI Status definition (all 12 CUA tables) for the program. Any row or field you omit is DROPPED. Always Read (ReadGuiStatus) → modify → Update, or use PatchGuiStatus for row-level merges. cua_data must include complete STA / FUN / PFK / BUT / TIT rows with all required fields (CODE, PFNO, FUNCODE, ...). Handles lock/unlock automatically.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly program_name: {
                readonly type: "string";
                readonly description: "Parent program name.";
            };
            readonly cua_data: {
                readonly description: "Complete CUA data — accepts either a JSON string or a structured object with ADM / STA / FUN / MEN / MTX / ACT / BUT / PFK / SET / DOC / TIT / BIV. Required row fields: STA.CODE, FUN.CODE, PFK.{CODE,PFNO,FUNCODE}, BUT.{PFK_CODE,CODE,NO,PFNO}, TIT.CODE. Missing rows are dropped — this is full-replace semantics.";
                readonly oneOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "object";
                }];
            };
            readonly transport_request: {
                readonly type: "string";
                readonly description: "Transport request number.";
            };
            readonly activate: {
                readonly type: "boolean";
                readonly description: "Activate after update. Default: false.";
            };
            readonly skip_validation: {
                readonly type: "boolean";
                readonly description: "Skip client-side schema validation. Default: false. Only set true if you know the CUA payload is intentionally partial and SAP will accept it.";
            };
        };
        readonly required: readonly ["program_name", "cua_data"];
    };
};
export declare function handleUpdateGuiStatus(context: HandlerContext, params: any): Promise<{
    isError: boolean;
    content: {
        type: string;
        text: any;
    }[];
}>;
//# sourceMappingURL=handleUpdateGuiStatus.d.ts.map