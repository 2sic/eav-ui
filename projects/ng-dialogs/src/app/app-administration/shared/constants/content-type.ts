/**
 * The pattern determines what content-type names are allowed.
 * Basically it's A-Z and numbers after the first digit.
 * But there is an exception: types describing an input-type begin with an '@' and can also contain `-` chars
 * Note (2dm): I'm not sure why there is '?:' non-capture in the first set - I think it's a mistake
 */
export const contentTypeNamePattern = /^([A-Za-z](?:[A-Za-z0-9]+)*)|(\@[A-Za-z0-9\-]+)$/;
export const contentTypeNameError = 'Standard letters and numbers are allowed. Must start with a letter.';
