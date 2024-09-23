import { FieldValueOrResultRaw } from './results/formula-results.models';
import { FormulaV1Context } from './run/formula-run-context.model';
import { FormulaV1Data } from './run/formula-run-data.model';
import { FormulaV1Experimental } from './run/formula-run-experimental.model';

//#region Formula strings / parts to process and show templates

/**
 * This must be in front of every formula so that JavaScript will run it.
 * Normally it's not there, so it's added before running the code.
 */
export const runFormulaPrefix = 'function ';

// V1 sample, just for reference
// const defaultFormulaV1 = `${requiredFormulaPrefix}v1 (data, context) {
//   return data.value;
// }`;

// new
const defaultFormulaV2 = `v2((data, context) => {
  return data.value;
});`;

export const defaultFormula = defaultFormulaV2;

const listItemFormulaV2 = `v2((data, context, item) => {
  return data.value;
});`;

export const defaultListItemFormula = listItemFormulaV2;

//#endregion

//#region Formula Function Types

export type FormulaFunction = FormulaFunctionDefault | FormulaFunctionV1;

export type FormulaFunctionDefault = () => FieldValueOrResultRaw;

export type FormulaFunctionV1 = (data: FormulaV1Data, context: FormulaV1Context, experimental: FormulaV1Experimental) => FieldValueOrResultRaw;

//#endregion

//#region Formula Versions

export const FormulaVersions = {
  V1: 'v1',
  V2: 'v2',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type FormulaVersion = (typeof FormulaVersions)[keyof typeof FormulaVersions];

//#endregion