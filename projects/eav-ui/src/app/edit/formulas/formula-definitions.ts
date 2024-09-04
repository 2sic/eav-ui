import { FieldValue, PickerItem } from 'projects/edit-types';
import { FormulaResultRaw } from './results/formula-results.models';
import { FormulaV1Context } from './run/formula-run-context.model';
import { FormulaV1Data } from './run/formula-run-data.model';
import { FormulaV1Experimental } from './run/formula-run-experimental.model';

//#region Formula strings / parts to process and show templates

export const requiredFormulaPrefix = 'function ';

// old, just for reference
const defaultFormulaV1 = `${requiredFormulaPrefix}v1 (data, context) {
  return data.value;
}`;

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

//#endregion

//#region Formula Function Types

export type FormulaFunction = FormulaFunctionDefault | FormulaFunctionV1;

export type FormulaFunctionDefault = () => FieldValue | FormulaResultRaw;

export type FormulaFunctionV1 = (data: FormulaV1Data, context: FormulaV1Context, experimental: FormulaV1Experimental, item: PickerItem) => FieldValue | FormulaResultRaw;

//#endregion

//#region Formula Versions

export const FormulaVersions = {
  V1: 'v1',
  V2: 'v2',
} as const;

export type FormulaVersion = (typeof FormulaVersions)[keyof typeof FormulaVersions];

//#endregion