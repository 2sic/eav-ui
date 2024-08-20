import { inject, Injectable, Signal } from "@angular/core";
import { FieldValue } from "projects/edit-types";
import { EntityReader } from "../shared/helpers";
import { EavContentType } from "../shared/models/eav";
import { FieldValuePair } from "./models/formula-results.models";
import { ItemService } from "../shared/store/ngrx-data";
import { RxHelpers } from '../../shared/rxJs/rx.helpers';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldsProps } from '../state/fields-configs.model';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';

const logThis = false;
const nameOfThis = 'FormItemFormulaService';

/**
 * Contains methods for updating value changes from formulas to the global state.
 * 
 * It's created in the field-settings-service and specific to one item.
 */
@Injectable()
export class ItemFormulaBroadcastService {

  private log = new EavLogger(nameOfThis, logThis);

  private itemService = inject(ItemService);

  valueFormulaCounter = 0;
  maxValueFormulaCycles = 5;

  private entityGuid: string;
  private contentType: Signal<EavContentType>;
  private reader: Signal<EntityReader>;
  private slotIsEmpty: Signal<boolean>;

  init(entityGuid: string, contentType: Signal<EavContentType>, reader: Signal<EntityReader>, slotIsEmpty: Signal<boolean>): void {
    this.entityGuid = entityGuid;
    this.contentType = contentType;
    this.reader = reader;
    this.slotIsEmpty = slotIsEmpty;
  }

  /**
   * Used to check if the value of a field should be updated with the value from a formula and if so, updates it.
   * @param formValues
   * @param fieldsProps
   * @param possibleValueUpdates
   * @param possibleFieldsUpdates
   * @param slotIsEmpty
   * @returns true if values are updated, false otherwise
   */
  applyValueChangesFromFormulas(
    formValues: ItemValuesOfLanguage,
    fieldsProps: FieldsProps,
    possibleValueUpdates: ItemValuesOfLanguage,
    possibleFieldsUpdates: FieldValuePair[],
  ): boolean {
    const entityGuid = this.entityGuid;
    const contentType = this.contentType();
    const slotIsEmpty = this.slotIsEmpty();

    const l = this.log.fn('applyValueChangesFromFormulas', { entityGuid: entityGuid, contentType, formValues, fieldsProps, possibleValueUpdates, possibleFieldsUpdates, slotIsEmpty });
    const valueUpdates: ItemValuesOfLanguage = {};
    for (const attribute of contentType.Attributes) {
      const fieldName = attribute.Name;
      const disabledBecauseTranslations = fieldsProps[fieldName]?.settings._disabledBecauseOfTranslation;
      const possibleFieldsUpdatesAttr = possibleFieldsUpdates.filter(f => f.name === fieldName);
      const original = formValues[fieldName];
      const valueFromFormula = possibleValueUpdates[fieldName];
      const valFromFields = possibleFieldsUpdatesAttr[possibleFieldsUpdatesAttr.length - 1]?.value;
      const newValue = valFromFields ? valFromFields : valueFromFormula;
      const shouldUpdate = this.shouldUpdate(original, newValue, slotIsEmpty, disabledBecauseTranslations);
      if (shouldUpdate)
        valueUpdates[fieldName] = newValue;
    }

    if (Object.keys(valueUpdates).length == 0)
      return l.r(false);

    if (this.maxValueFormulaCycles > this.valueFormulaCounter) {
      this.valueFormulaCounter++;
      this.itemService.updateItemAttributesValues(entityGuid, valueUpdates, this.reader());
      // return true to make sure fieldProps are not updated yet
      return l.r(true);
    }
    return l.r(false, 'Max value formula cycles reached');
  }

  /**
   * Used to check if the value of a field should be updated with the value from a formula.
   * @param valueBefore
   * @param valueFromFormula
   * @param slotIsEmpty
   * @param disabledBecauseTranslations
   * @returns true if value should be updated, false otherwise
   */
  private shouldUpdate(
    valueBefore: FieldValue,
    valueFromFormula: FieldValue,
    slotIsEmpty: boolean,
    disabledBecauseTranslations: boolean
  ): boolean {
    // important to compare with undefined because null is allowed value
    if (slotIsEmpty || disabledBecauseTranslations || valueBefore === undefined || valueFromFormula === undefined)
      return false;

    let valuesNotEqual = valueBefore !== valueFromFormula;
    // do a more in depth comparison in case of calculated entity fields
    if (valuesNotEqual && Array.isArray(valueBefore) && Array.isArray(valueFromFormula)) {
      valuesNotEqual = !RxHelpers.arraysEqual(valueBefore as string[], valueFromFormula as string[]);
    }
    return valuesNotEqual;
  }
}

