import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { FieldValuePair } from '../formulas/models/formula-results.models';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { FieldsPropsEngine } from './fields-properties-engine';
import { Signal } from '@angular/core';
import { EavContentType } from '../shared/models/eav/eav-content-type';

const logThis = false;
const nameOfThis = 'FieldsValuesModifiedHelper';

export class FieldsValuesModifiedHelper {
  private log = new EavLogger(nameOfThis, logThis);

  constructor(
    private contentType: Signal<EavContentType>,
    private slotIsEmpty: Signal<boolean>) {
  }

  getValueUpdates(
    engine: FieldsPropsEngine,
    valueUpdatesFromSideEffects: FieldValuePair[],
    valueUpdates: ItemValuesOfLanguage,
  ): ItemValuesOfLanguage {
    const contentType = this.contentType();
    const slotIsEmpty = this.slotIsEmpty();

    const formValues = engine.values;
    const fieldsProps = engine.fieldProps;
    const l = this.log.fn('applyValueChangesFromFormulas', { contentType, formValues, fieldsProps, valueUpdates, valueUpdatesFromSideEffects, slotIsEmpty });

    if (slotIsEmpty)
      return l.r({}, 'Slot is empty, exit early');

    const result: ItemValuesOfLanguage = {};
    for (const attribute of contentType.Attributes) {
      const fieldName = attribute.Name;
      const original = formValues[fieldName];

      // if field is not in formValues, we should not update it. Check `undefined` because `null` is allowed
      if (original === undefined)
        continue;

      // If field is read-only because of translation, skip
      if (fieldsProps[fieldName]?.settings._disabledBecauseOfTranslation)
        continue;

      const newValue = this.#findBestValue(fieldName, valueUpdatesFromSideEffects, valueUpdates);
      const shouldUpdate = this.#valueAreDifferent(original, newValue);
      if (shouldUpdate)
        result[fieldName] = newValue;
    }
    return result;
  }

  #findBestValue(fieldName: string, fieldsUpdates: FieldValuePair[], valueUpdates: ItemValuesOfLanguage) {
    // First check if a formula had given a value as a side-effect of it's own calculation
    // This is prioritized in case we have both,
    // because it's very rare and it's usually something which resets another field
    // In case we get many, we'll just keep the last one.
    const sideEffects = fieldsUpdates.filter(f => f.name === fieldName);
    const valSideEffect = sideEffects[sideEffects.length - 1]?.value; // findLast
    if (valSideEffect != null)
      return valSideEffect;

    // If no value from formula, check if the field has a new value from a formula
    return valueUpdates[fieldName];
  }

  /**
   * Used to check if the value of a field should be updated with the value from a formula.
   * @returns true if value should be updated, false otherwise
   */
  #valueAreDifferent(valueBefore: FieldValue, valueNew: FieldValue): boolean {
    // important to compare with undefined because null is allowed value
    if (valueNew === undefined)
      return false;

    let valuesNotEqual = valueBefore !== valueNew;
    // do a more in depth comparison in case of calculated entity fields
    if (valuesNotEqual && Array.isArray(valueBefore) && Array.isArray(valueNew))
      valuesNotEqual = !RxHelpers.arraysEqual(valueBefore as string[], valueNew as string[]);

    return valuesNotEqual;
  }
}