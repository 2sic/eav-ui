import { Injectable } from '@angular/core';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { TargetOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { FormulaIdentifier } from '../results/formula-results.models';
import { FormulaDefaultTargets, FormulaNewPickerTargets, FormulaOptionalTargets, FormulaTarget } from './formula-targets';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { ItemService } from '../../state/item.service';
import { ContentTypeService } from '../../shared/content-types/content-type.service';

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

  getTargetOptions(id: FormulaIdentifier, formulas: FormulaCacheItem[]): TargetOption[] {
    // Create a list of formula targets for the selected field - eg. Value, Tooltip, ListItem.Label, ListItem.Tooltip etc.
    const targetOptions: TargetOption[] = [];
    if (id.entityGuid == null || id.fieldName == null)
      return targetOptions;

    const fieldFormulas = formulas.filter(f => f.entityGuid === id.entityGuid && f.fieldName === id.fieldName);

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
    const item = this.itemService.get(id.entityGuid);
    const attribute = this.contentTypeService.getAttributeOfItem(item, id.fieldName);
    const inputType = attribute.InputType;
    if (InputTypeHelpers.isGroupStart(inputType)) {
      for (const target of [FormulaOptionalTargets.Collapsed]) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }
    if (InputTypeHelpers.isOldValuePicker(inputType)) {
      for (const target of [FormulaOptionalTargets.DropdownValues]) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }

    // TODO: HERE
    if (InputTypeHelpers.isNewPicker(inputType)) {
      for (const target of Object.values(FormulaNewPickerTargets)) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: "Picker " + target.substring(target.lastIndexOf('.') + 1),
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
    const selectedExists = targetOptions.some(t => t.target === id.target);
    if (!selectedExists) {
      const targetOption: TargetOption = {
        hasFormula: fieldFormulas.some(f => f.target === id.target),
        label: id.target.substring(id.target.lastIndexOf('.') + 1),
        target: id.target,
      };
      targetOptions.push(targetOption);
    }
    return targetOptions;    
  }

}