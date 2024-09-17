import { FieldValue } from '../../../../../edit-types/src/FieldValue';
import { NameValuePair } from '../formulas/results/formula-results.models';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { Signal } from '@angular/core';
import { EavContentType } from '../shared/models/eav/eav-content-type';
import { FieldValueHelpers } from '../shared/helpers/field-value.helpers';
import { FieldsPropsEngineCycle } from './fields-properties-engine-cycle';
import { classLog } from '../../shared/logging';

export class FieldsValuesModifiedHelper {
  private log = classLog({FieldsValuesModifiedHelper});

  constructor(
    private contentType: Signal<EavContentType>,
    private slotIsEmpty: Signal<boolean>,
  ) { }


  // NEW WIP
  getValueUpdates(
    cycle: FieldsPropsEngineCycle,
    valueUpdatesFromSideEffects: NameValuePair[],
    valueUpdates: ItemValuesOfLanguage,
    originalValues?: ItemValuesOfLanguage
  ): ItemValuesOfLanguage {
    const contentType = this.contentType();
    const slotIsEmpty = this.slotIsEmpty();

    originalValues ??= cycle.values;
    const fieldsProps = cycle.fieldProps;
    const l = this.log.fn('getValueUpdates', { contentType, originalValues, fieldsProps, valueUpdates, valueUpdatesFromSideEffects, slotIsEmpty });

    if (slotIsEmpty)
      return l.r({}, 'Slot is empty, exit early');

    const prep = contentType.Attributes
      .map(attr => ({
        name: attr.Name,
        original: originalValues[attr.Name],
      }))
      // Only skip force disabled, not all disabled. If it's only disabled because the user shouldn't interact with it, we still want to update it.
      .filter(p => p.original !== undefined && !fieldsProps[p.name]?.settings.uiDisabledForced)
      .map(p => ({
        ...p,
        value: this.#findBestValue(p.name, valueUpdatesFromSideEffects, valueUpdates)
      }))
      .filter(p => p.value !== undefined && !FieldValueHelpers.fieldValuesAreEqual(p.original, p.value))


    // Convert to object
    const changes = prep.reduce((acc, p) => { acc[p.name] = p.value; return acc; }, {} as ItemValuesOfLanguage);
    return l.rSilent(changes);
  }

  #findBestValue(fieldName: string, fieldsUpdates: NameValuePair[], valueUpdates: ItemValuesOfLanguage): FieldValue {
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

}