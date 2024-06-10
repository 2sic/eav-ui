import { Injectable } from "@angular/core";
import { FieldValue } from "projects/edit-types";
import { EntityReader, GeneralHelpers } from "../shared/helpers";
import { FormValues, FieldsProps } from "../shared/models";
import { EavContentType } from "../shared/models/eav";
import { FieldValuePair } from "./models/formula-results.models";
import { ItemService } from "../shared/store/ngrx-data";

/**
 * Contains methods for updating value changes from formulas.
 */
@Injectable()
export class FormItemFormulaService {
  private itemService: ItemService = null;

  valueFormulaCounter = 0;
  maxValueFormulaCycles = 5;

  init(itemService: ItemService) {
    this.itemService = itemService;
  }

  /**
   * Used to check if the value of a field should be updated with the value from a formula and if so, updates it.
   * @param entityGuid 
   * @param contentType 
   * @param formValues 
   * @param fieldsProps 
   * @param possibleValueUpdates 
   * @param possibleFieldsUpdates 
   * @param slotIsEmpty 
   * @param entityReader 
   * @returns true if values are updated, false otherwise
   */
  applyValueChangesFromFormulas(
    entityGuid: string,
    contentType: EavContentType,
    formValues: FormValues,
    fieldsProps: FieldsProps,
    possibleValueUpdates: FormValues,
    possibleFieldsUpdates: FieldValuePair[],
    slotIsEmpty: boolean,
    entityReader: EntityReader): boolean {
    const valueUpdates: FormValues = {};
    for (const attribute of contentType.Attributes) {
      const possibleFieldsUpdatesForAttribute = possibleFieldsUpdates.filter(f => f.name === attribute.Name);
      const valueBefore = formValues[attribute.Name];
      const valueFromFormula = possibleValueUpdates[attribute.Name];
      const fieldsFromFormula =
        possibleFieldsUpdatesForAttribute[possibleFieldsUpdatesForAttribute.length - 1]?.value;
      const newValue = fieldsFromFormula ? fieldsFromFormula : valueFromFormula;
      if (this.shouldUpdate(valueBefore, newValue, slotIsEmpty, fieldsProps[attribute.Name]?.settings._disabledBecauseOfTranslation)) {
        valueUpdates[attribute.Name] = newValue;
      }
    }

    if (Object.keys(valueUpdates).length > 0) {
      if (this.maxValueFormulaCycles > this.valueFormulaCounter) {
        this.valueFormulaCounter++;
        this.itemService.updateItemAttributesValues(entityGuid, valueUpdates, entityReader);
        // return true to make sure fieldProps are not updated yet
        return true;
      } else {
        // consoleLogEditForm('Max value formula cycles reached');
        return false;
      }
    }
    return false;
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
      valuesNotEqual = !GeneralHelpers.arraysEqual(valueBefore as string[], valueFromFormula as string[]);
    }
    return valuesNotEqual;
  }
}

