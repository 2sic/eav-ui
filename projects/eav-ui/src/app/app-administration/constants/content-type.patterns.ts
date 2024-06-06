/**
 * This is for the angular UI.
 * Note that since ca. 2023 the last "-" literal character must be escaped using "\-"
 * because of changes in how browsers handle regular expressions, aka the /v flag.
 */
const contentTypeNameRegEx = /(^[A-Za-z][A-Za-z0-9]*$)|(^@[A-Za-z][A-Za-z0-9\-]*$)/;
const typeNameRegExCleaned = contentTypeNameRegEx.toString();
const removeSlashAtStartAndEnd = typeNameRegExCleaned.substring(1, typeNameRegExCleaned.toString().length - 1);

/**
 * The pattern determines what content-type names are allowed.
 * Basically it's A-Z and numbers after the first digit.
 * But there are two exceptions:
 *  - types describing an input-type begin with an `@` and can also contain `-` chars
 *  - types beginning with an `|` are very old type names for data-sources, they can contain anything!
 */
export const contentTypeNamePattern = removeSlashAtStartAndEnd;
export const contentTypeNameError = 'Standard letters and numbers are allowed. Must start with a letter.';

// 2020-04-29 2dm - temporarily used this pattern while renaming unique named types containing '|' chars
// export const contentTypeNamePattern = /(^[A-Za-z][A-Za-z0-9]+$)|(^@[A-Za-z][A-Za-z0-9-]*$)|(^\|.*$)/;
