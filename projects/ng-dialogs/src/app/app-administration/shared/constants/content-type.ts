/**
 * The pattern determines what content-type names are allowed.
 * Basically it's A-Z and numbers after the first digit.
 * But there is an exception: types describing an input-type begin with an '@'
 */
export const contentTypeNamePattern = /^[@A-Za-z](?:[A-Za-z0-9]+)*$/;
export const contentTypeNameError = 'Standard letters and numbers are allowed. Must start with a letter.';
