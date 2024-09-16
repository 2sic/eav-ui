import { FieldValue } from 'projects/edit-types';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { NameValuePair } from "../results/formula-results.models";

/**
 * The result of a formula promise.
 * Contains queues of things to broadcast on the next processing cycle.
 */
export class FormulaPromiseResult {
  constructor(
    public entityGuid: string,
    public valueUpdates: ItemValuesOfLanguage,
    public fieldUpdates: NameValuePair[],
  ) {
  }

  public data: Record<string, FormulaPromiseResultField> = {};

  public getOrCreateField(fieldName: string, value?: FieldValue): FormulaPromiseResultField {
    if (!this.data[fieldName])
      this.data[fieldName] = new FormulaPromiseResultField(fieldName, value);
    return this.data[fieldName];
  }
}

class FormulaPromiseResultField {
  constructor(public name: string, public value?: FieldValue) { }
  fields: NameValuePair[] = null;
  settings: Record<string, unknown>;
}

export interface FieldSettingPair {
  name: string;
  settings: NameValuePair[];
}
