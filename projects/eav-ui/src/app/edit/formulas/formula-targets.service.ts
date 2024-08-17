import { Injectable } from '@angular/core';
import { InputTypeConstants } from '../../content-type-fields/constants/input-type.constants';
import { TargetOption } from '../dialog/footer/formula-designer/formula-designer.models';
import { EmptyFieldHelpers } from '../form/fields/empty/empty-field-helpers';
import { InputFieldHelpers } from '../shared/helpers/input-field.helpers';
import { DesignerState } from './models/formula-results.models';
import { FormulaCacheItem, FormulaDefaultTargets, FormulaListItemTargets, FormulaOptionalTargets, FormulaTarget } from './models/formula.models';
import { ContentTypeService, ItemService } from '../shared/store/ngrx-data';

/**
 * Small helper service to get the target options for the formula designer.
 * 
 * The purpose is to figure out what targets are possible for each field (eg. Settings.Name, etc.)
 * and to ensure that the information (eg. hasFormula) is correct.
 */
@Injectable()
export class FormulaTargetsService {

  constructor(
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
  ) { }

  getTargetOptions(designer: DesignerState, formulas: FormulaCacheItem[]): TargetOption[] {
    // Create a list of formula targets for the selected field - eg. Value, Tooltip, ListItem.Label, ListItem.Tooltip etc.
    const targetOptions: TargetOption[] = [];
    if (designer.entityGuid == null || designer.fieldName == null)
      return targetOptions;

    const fieldFormulas = formulas.filter(f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName);

    // default targets
    for (const target of Object.values(FormulaDefaultTargets)) {
      const targetOption: TargetOption = {
        hasFormula: fieldFormulas.some(f => f.target === target),
        label: target.substring(target.lastIndexOf('.') + 1),
        target,
      };
      targetOptions.push(targetOption);
    }

    // optional targets
    const item = this.itemService.getItem(designer.entityGuid);
    const contentTypeId = InputFieldHelpers.getContentTypeNameId(item);
    const contentType = this.contentTypeService.getContentType(contentTypeId);
    const attribute = contentType.Attributes.find(a => a.Name === designer.fieldName);
    const inputType = attribute.InputType;
    if (EmptyFieldHelpers.isGroupStart(inputType)) {
      for (const target of [FormulaOptionalTargets.Collapsed]) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }
    if (inputType === InputTypeConstants.StringDropdown || inputType === InputTypeConstants.NumberDropdown) {
      for (const target of [FormulaOptionalTargets.DropdownValues]) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }
    if (inputType === InputTypeConstants.EntityPicker
      || inputType === InputTypeConstants.StringPicker
      || inputType === InputTypeConstants.NumberPicker) {
      for (const target of Object.values(FormulaListItemTargets)) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: "List Item " + target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }

    /* TODO: for picker types WIP
      add formulas -> Field.ListItem.Label
                      Field.ListItem.Tooltip
                      Field.ListItem.Information
                      Field.ListItem.HelpLink
                      Field.ListItem.Disabled

      Template for all new type formulas
      v2((data, context, item) => {
        return data.value;
      });

      old template for all of the rest

      run formulas upon dropdowning the picker, upon each opening
    */

    // targets for formulas
    for (const formula of fieldFormulas) {
      const formulaExists = targetOptions.some(t => t.target === formula.target);
      if (formulaExists) 
        continue;

      const targetOption: TargetOption = {
        hasFormula: true,
        label: formula.target.substring(formula.target.lastIndexOf('.') + 1),
        target: formula.target,
      };
      targetOptions.push(targetOption);
    }

    // currently selected target
    const selectedExists = targetOptions.some(t => t.target === designer.target);
    if (!selectedExists) {
      const targetOption: TargetOption = {
        hasFormula: fieldFormulas.some(f => f.target === designer.target),
        label: designer.target.substring(designer.target.lastIndexOf('.') + 1),
        target: designer.target,
      };
      targetOptions.push(targetOption);
    }
    return targetOptions;    
  }

}