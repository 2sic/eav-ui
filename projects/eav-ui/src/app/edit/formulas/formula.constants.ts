export const requiredFormulaPrefix = 'function ';

// 2022-07-05 2dm had to fix 'v1' because somehow a 'v1 ' was expected
export const formV1Prefix = 'v1';

const defaultFormulaV1 = `${requiredFormulaPrefix}v1 (data, context) {
  return data.value;
}`;

export const formV2Prefix = 'v2';

const defaultFormulaV2 = `// new formula syntax - see https://go.2sxc.org/formulas
v2((data, context) => {
  return data.value;
});`;

export const defaultFormulaNow = defaultFormulaV2;

const listItemFormulaV2 = `v2((data, context, item) => {
  return data.value;
});`;

export const listItemFormulaNow = listItemFormulaV2;
