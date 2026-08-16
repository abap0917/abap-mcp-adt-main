import { AdtClient } from '@babamba2/mcp-abap-adt-clients';
import type { IAbapConnection, ILogger } from '@babamba2/mcp-abap-adt-interfaces';
export declare function createAdtClient(connection: IAbapConnection, logger?: ILogger): AdtClient;
export declare function getAdtClient(): AdtClient;
export declare function resetClientCache(): void;
//# sourceMappingURL=clients.d.ts.map