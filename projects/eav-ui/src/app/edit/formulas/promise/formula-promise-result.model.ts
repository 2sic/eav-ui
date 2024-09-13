import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { NameValuePair } from "../results/formula-results.models";

/**
 * The result of a formula promise.
 * Contains queues of things to broadcast on the next processing cycle.
 */
export class FormulaPromiseResult {
  constructor(
    public valueUpdates: ItemValuesOfLanguage,
    public fieldUpdates: NameValuePair[],
    public settingUpdates: FieldSettingPair[]
  ) {
  }
}

export interface FieldSettingPair {
  name: string;
  settings: NameValuePair[];
}
