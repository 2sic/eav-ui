/**
 * The pattern determines what content-type names are allowed.
 * Basically it's A-Z and numbers after the first digit.
 * But there are two exceptions:
 *  - types describing an input-type begin with an `@` and can also contain `-` chars
 *  - types beginning with an `|` are very old type names for data-sources, they can contain anything!
 */
export const contentTypeNamePattern = /(^[A-Za-z][A-Za-z0-9]+$)|(^@[A-Za-z][A-Za-z0-9-]*$)/;
export const contentTypeNameError = 'Standard letters and numbers are allowed. Must start with a letter.';

// 2020-04-29 2dm - temporarily used this pattern while renaming unique named types containing '|' chars
// export const contentTypeNamePattern = /(^[A-Za-z][A-Za-z0-9]+$)|(^@[A-Za-z][A-Za-z0-9-]*$)|(^\|.*$)/;
