import { Injectable } from "@angular/core";
import { FieldValue } from "projects/edit-types";
import { EntityReader, GeneralHelpers } from "../shared/helpers";
import { FormValues, FieldsProps } from "../shared/models";
import { EavContentType } from "../shared/models/eav";
import { FieldValuePair } from "./models/formula-results.models";
import { ItemService } from "../shared/store/ngrx-data";

// TODO: @SDV - move this and `shouldUpdate` to a new class into the formulas server FormFormulasService 'form-formula-service.ts'
// You should also move the formulaCount variables etc. to that
// Goal is that the SettingsService is slimmed down to have almost no more formulas work
// Note that each field-settings-service should probably get it's own FormFormulasService so it behaves as before (so singleton)

@Injectable()
export class FormFormulaService {
  private itemService: ItemService = null;

  valueFormulaCounter = 0;
  maxValueFormulaCycles = 5;

  init(itemService: ItemService) {
    this.itemService = itemService;
  }

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
        this.itemService.updateItemAttributesValues(
          entityGuid, valueUpdates, entityReader.currentLanguage, entityReader.defaultLanguage
        );
        // return true to make sure fieldProps are not updated yet
        return true;
      } else {
        // consoleLogWebpack('Max value formula cycles reached');
        return false;
      }
    }
    return false;
  }

  private shouldUpdate(
    valueBefore: FieldValue, valueFromFormula: FieldValue,
    slotIsEmpty: boolean, disabledBecauseTranslations: boolean
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

