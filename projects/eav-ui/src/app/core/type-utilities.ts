
// Old example
// export type OfFeatureName = typeof FeatureNames[keyof typeof FeatureNames];

// TODO: @2pp put in a shared file and replace other typeof X[keyof typeof X]; (look for "keyof typeof")
/**
 * This will allow us to restrict the possible values (usually strings)
 * to be values of a const object - which we often use as catalogs / lookup lists.
 */
export type Of<T> = T[keyof T];