/**
 * Configuration module for SAP connection
 *
 * Extracted from index.ts to avoid circular dependencies
 * when v2 server imports handlers that use lib/utils
 */
import type { SapConfig } from '@babamba2/mcp-abap-connection';
export declare function getConfig(): SapConfig;
export declare function setSapConfigOverride(config?: SapConfig): void;
//# sourceMappingURL=config.d.ts.map