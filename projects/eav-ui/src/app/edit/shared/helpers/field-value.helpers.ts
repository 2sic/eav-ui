import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { RxHelpers } from '../../../shared/rxJs/rx.helpers';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';


export class FieldValueHelpers {
  /** Detect if two values are equal, incl. special NaN and Array checks */
  static fieldValuesAreEqual(x: FieldValue, y: FieldValue): boolean {
    if (x === y) return true;
    if (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y)) return true;
    if (Array.isArray(x) && Array.isArray(y) && RxHelpers.arraysEqual(x, y)) return true;
    return false;
  }

  /** Searches where newValues has values different from oldValues */
  static getItemValuesChanges(oldValues: ItemValuesOfLanguage, newValues: ItemValuesOfLanguage): ItemValuesOfLanguage {
    const changes: ItemValuesOfLanguage = {};
    for (const key of Object.keys(newValues)) {
      const newValue = newValues[key];
      const oldValue = oldValues[key];
      if (FieldValueHelpers.fieldValuesAreEqual(newValue, oldValue))
        continue;

      changes[key] = newValue;
    }
    return Object.keys(changes).length === 0 ? undefined : changes;
  }
}
