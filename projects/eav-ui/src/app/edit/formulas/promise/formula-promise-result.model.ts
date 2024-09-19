import { FieldValueOrResultRaw, NameValuePair } from "../results/formula-results.models";
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

/**
 * The result of a formula promise.
 * Contains queues of things to broadcast on the next processing cycle.
 */
export class FormulaPromiseResult {
  constructor(public entityGuid: string) { }

  public data: Record<string, FormulaPromiseResultField> = {};
}

interface FormulaPromiseResultField {
  name: string;
  value?: FieldValue;
  fields: NameValuePair[];
  settings: Record<string, unknown>;
}

export interface FieldSettingPair {
  name: string;
  settings: NameValuePair[];
}


export interface FormulaPromise {
  promise: Promise<FieldValueOrResultRaw>;
  sleep: boolean;
  completed: boolean;
}