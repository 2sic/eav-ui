import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FieldValuePair } from "../results/formula-results.models";
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';

/**
 * The result of a formula promise.
 * Contains queues of things to broadcast on the next processing cycle.
 */
export class FormulaPromiseResult {
  constructor(
    public valueUpdates: ItemValuesOfLanguage,
    public fieldUpdates: FieldValuePair[],
    public settingUpdates: FieldSettingPair[]
  ) {
  }
}

export interface FieldSettingPair {
  name: string;
  settings: SettingPair[];
}

interface SettingPair {
  settingName: string;
  value: FieldValue;
}

