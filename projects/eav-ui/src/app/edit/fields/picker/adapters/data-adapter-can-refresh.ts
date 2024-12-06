export interface DataAdapterCanRefresh {
    /** Initialize Prefetch - Optional methods to implement */
    initPrefetch(prefetchGuids: string[]): void;

    /** Force Reload Data - Optional methods to implement */
    forceReloadData(missingData: string[]): void;

}