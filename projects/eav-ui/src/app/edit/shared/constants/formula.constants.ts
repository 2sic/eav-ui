export const requiredFormulaPrefix = 'function ';

// 2022-07-05 2dm had to fix 'v1' because somehow a 'v1 ' was expected
export const formV1Prefix = 'v1';

export const defaultFormulaV1 = `${requiredFormulaPrefix}v1 (data, context) {
  return data.value;
}`;
