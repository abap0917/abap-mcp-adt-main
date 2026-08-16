/**
 * Keychain-backed secret resolution for multi-profile SAP connections.
 *
 * Profile env files may contain `SAP_PASSWORD=keychain:<service>/<account>`
 * references instead of plaintext. This module resolves those references
 * against the OS keychain (Windows Credential Manager, macOS Keychain,
 * Linux libsecret) via `@napi-rs/keyring`.
 *
 * The keychain module is loaded lazily via `require` so that headless
 * environments (Docker, CI) without the native dependency can still load
 * the rest of the server — they just cannot resolve `keychain:` references.
 */
export declare class KeychainUnavailableError extends Error {
    readonly code = "ERR_KEYCHAIN_UNAVAILABLE";
    constructor(cause: unknown);
}
export declare class KeychainEntryNotFoundError extends Error {
    readonly service: string;
    readonly account: string;
    readonly code = "ERR_KEYCHAIN_NOT_FOUND";
    constructor(service: string, account: string);
}
export declare class InvalidKeychainReferenceError extends Error {
    readonly code = "ERR_KEYCHAIN_REF_INVALID";
    constructor(value: string);
}
export interface KeychainReference {
    service: string;
    account: string;
}
/** Test-only cache reset. */
export declare function __resetKeychainCache(): void;
/**
 * Parse a `keychain:<service>/<account>` string.
 * Returns `null` if the value is not a keychain reference.
 * Throws `InvalidKeychainReferenceError` if the prefix is present but malformed.
 */
export declare function parseKeychainRef(value: string): KeychainReference | null;
/**
 * Resolve a potentially-keychain-backed secret to its plaintext value.
 * Plain strings pass through unchanged.
 */
export declare function resolveSecret(value: string): string;
/** Write a plaintext secret to the OS keychain. Used by profile add/edit. */
export declare function storeSecret(ref: KeychainReference, plaintext: string): void;
/** Delete a secret from the OS keychain. Used by profile remove. */
export declare function deleteSecret(ref: KeychainReference): boolean;
/** Format a keychain reference back into canonical `keychain:<service>/<account>`. */
export declare function formatKeychainRef(ref: KeychainReference): string;
//# sourceMappingURL=secrets.d.ts.map