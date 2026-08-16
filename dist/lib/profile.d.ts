/**
 * Multi-profile SAP connection management.
 *
 * Resolves an "active profile" from the project-local pointer file
 * `<cwd>/.sc4sap/active-profile.txt`, loads the corresponding profile env
 * from `~/.sc4sap/profiles/<alias>/sap.env`, and overwrites `process.env.SAP_*`
 * so the rest of the server (connection factory, handlers) observes the
 * selected system transparently.
 *
 * When no active-profile.txt is present, falls back to the legacy
 * `<cwd>/.sc4sap/sap.env`. In legacy mode, SAP_TIER defaults to 'DEV' so
 * existing single-profile users retain their previous (permissive) behavior.
 *
 * Keychain references in SAP_PASSWORD (`keychain:<service>/<account>`) are
 * resolved via @napi-rs/keyring at load time. See ./secrets.
 */
export type Tier = 'DEV' | 'QA' | 'PRD';
export interface LoadedProfile {
    /** Alias as written in active-profile.txt, or `undefined` for legacy single-profile mode. */
    alias: string | undefined;
    /** Absolute path of the env file that was loaded. */
    sourcePath: string;
    /** Parsed env variables (password already resolved if keychain-backed). */
    envVars: Record<string, string>;
    /** Resolved tier (defaults to DEV if SAP_TIER is missing). */
    tier: Tier;
    /** True if the profile is read-only (tier !== DEV). */
    readonly: boolean;
    /** True when loaded via the legacy single-profile fallback. */
    legacy: boolean;
}
/**
 * Load the active profile (or legacy sap.env) without mutating process.env.
 * Throws if an alias is pointed to but the profile folder does not exist.
 */
export declare function loadActiveProfile(cwd?: string): LoadedProfile;
/**
 * Overwrite process.env.SAP_* with the loaded profile's values and cache the
 * tier for the readonly guard. Callers must invoke this before any consumer
 * reads process.env (i.e. before connection factories, config managers).
 */
export declare function applyProfile(loaded: LoadedProfile): void;
/** Returns the currently-active tier (defaults to 'DEV' before any load). */
export declare function getActiveTier(): Tier;
/** Returns the currently-active alias, or undefined in legacy mode. */
export declare function getActiveAlias(): string | undefined;
/** Returns true iff the active profile is read-only (QA or PRD). */
export declare function isReadOnlyTier(): boolean;
/**
 * Load the active profile and apply it to process.env in one step. Idempotent:
 * safe to call multiple times. Used at server startup and by ReloadProfile.
 */
export declare function activateProfile(cwd?: string): LoadedProfile;
/** Test-only reset of the cached tier/alias. */
export declare function __resetProfileState(): void;
//# sourceMappingURL=profile.d.ts.map