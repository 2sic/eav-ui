import { Injectable } from '@angular/core';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { TargetOption } from '../dialog/footer/formula-designer/formula-designer.models';
import { DesignerState } from './models/formula-results.models';
import { FormulaDefaultTargets, FormulaListItemTargets, FormulaOptionalTargets, FormulaTarget } from './models/formula.models';
import { FormulaCacheItem } from './models/formula-cache.model';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { ItemService } from '../shared/store/item.service';
import { ContentTypeService } from '../shared/store/content-type.service';

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
    const item = this.itemService.get(designer.entityGuid);
    const contentType = this.contentTypeService.getContentTypeOfItem(item);
    const attribute = contentType.Attributes.find(a => a.Name === designer.fieldName);
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
    if (inputType === InputTypeCatalog.StringDropdown || inputType === InputTypeCatalog.NumberDropdown) {
      for (const target of [FormulaOptionalTargets.DropdownValues]) {
        const targetOption: TargetOption = {
          hasFormula: fieldFormulas.some(f => f.target === target),
          label: target.substring(target.lastIndexOf('.') + 1),
          target: target as FormulaTarget,
        };
        targetOptions.push(targetOption);
      }
    }
    if (inputType === InputTypeCatalog.EntityPicker
      || inputType === InputTypeCatalog.StringPicker
      || inputType === InputTypeCatalog.NumberPicker) {
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