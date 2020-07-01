/** Encodes `/` in URL parameter to not mess up routing. Don't forget to decode it! :) */
export function paramEncode(text: string) {
  const prepared = text.replace(/\//g, '%2F');
  return prepared;
}

/** Decodes `/` in URL parameter */
export function paramDecode(text: string) {
  const reverted = text.replace(/%2F/g, '/');
  return reverted;
}
