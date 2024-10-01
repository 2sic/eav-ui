/**
 * This will allow us to restrict the possible values (usually strings)
 * to be values of a const object - which we often use as catalogs / lookup lists.
 */
export type Of<T> = T[keyof T];