import type { IAbapConnection } from '@babamba2/mcp-abap-adt-interfaces';
export interface IAdtSystemContext {
    masterSystem?: string;
    responsible?: string;
    client?: string;
    isLegacy?: boolean;
}
export declare function resolveSystemContext(connection: IAbapConnection, overrides?: Partial<IAdtSystemContext>): Promise<IAdtSystemContext>;
export declare function getSystemContext(): IAdtSystemContext;
export declare function resetSystemContextCache(): void;
//# sourceMappingURL=systemContext.d.ts.map