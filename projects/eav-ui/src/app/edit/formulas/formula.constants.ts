export const requiredFormulaPrefix = 'function ';

// 2022-07-05 2dm had to fix 'v1' because somehow a 'v1 ' was expected
export const formV1Prefix = 'v1';

// old, just for reference
const defaultFormulaV1 = `${requiredFormulaPrefix}v1 (data, context) {
  return data.value;
}`;

export const formV2Prefix = 'v2';

// new
const defaultFormulaV2 = `// new formula syntax - see https://go.2sxc.org/formulas
v2((data, context) => {
  return data.value;
});`;

export const defaultFormula = defaultFormulaV2;

const listItemFormulaV2 = `v2((data, context, item) => {
  return data.value;
});`;

export const defaultListItemFormula = listItemFormulaV2;
