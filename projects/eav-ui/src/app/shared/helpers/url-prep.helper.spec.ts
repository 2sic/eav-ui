import { _test } from "./url-prep.helper";

const { paramEncode, paramDecode } = _test;

describe('URL-Prep Helpers', () => {
  const testCases = [
    { input: 'a/b', encoded: 'a%2Fb' },
    { input: 'a:b', encoded: 'a%3Ab' },
    { input: 'a&b', encoded: 'a%26b' },
    { input: 'a~b', encoded: 'a%7Eb' },
    { input: 'a,b', encoded: 'a%2Cb' },
    { input: 'a/b:c&d~e,f', encoded: 'a%2Fb%3Ac%26d%7Ee%2Cf' },
    { input: '', encoded: '' },
    { input: null as unknown as string, encoded: '' },
    { input: undefined as unknown as string, encoded: '' },
  ];

  for (const { input, encoded } of testCases) {
    it(`should encode "${input}" to "${encoded}"`, () => {
      expect((paramEncode)(input)).toBe(encoded);
    });

    it(`should decode "${encoded}" to "${input ?? ''}"`, () => {
      expect((paramDecode)(encoded)).toBe(input ?? '');
    });
  }
});
