import { FieldValue } from 'projects/edit-types';
import { NameValuePair } from "../results/formula-results.models";

/**
 * The result of a formula promise.
 * Contains queues of things to broadcast on the next processing cycle.
 */
export class FormulaPromiseResult {
  constructor(
    public entityGuid: string,
    public fieldUpdates: NameValuePair[],
  ) {
  }

  public data: Record<string, FormulaPromiseResultField> = {};

  public getOrCreateField(fieldName: string, value?: FieldValue): FormulaPromiseResultField {
    if (!this.data[fieldName])
      this.data[fieldName] = { name: fieldName, value, fields: [], settings: {} };
    return this.data[fieldName];
  }
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
