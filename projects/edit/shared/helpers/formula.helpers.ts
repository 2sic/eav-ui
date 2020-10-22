import { take } from 'rxjs/operators';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { CalcFields, FieldFormulas, FormulaType } from './formula.models';
import { LocalizationHelper } from './localization-helper';

export function findFieldFormulas(
  type: FormulaType,
  fieldConfigs: FieldConfigSet[],
  contentTypeItemService: ContentTypeItemService,
  lang: string,
  defaultLang: string,
) {
  const calcFields: CalcFields = {};
  findFieldsWithCalcs(calcFields, fieldConfigs);
  const formulas = findFormulas(calcFields, type, contentTypeItemService, lang, defaultLang);
  return formulas;
}

function findFieldsWithCalcs(calcFields: CalcFields, fieldConfigs: FieldConfigSet[]) {
  for (const fieldConfig of fieldConfigs) {
    const fieldConfigGroup = fieldConfig.field as FieldConfigGroup;
    if (fieldConfigGroup.fieldGroup != null) {
      findFieldsWithCalcs(calcFields, fieldConfigGroup.fieldGroup);
    } else {
      const calcs = fieldConfig.field.settings$.value.Calculations;
      if (calcs == null || !calcs.length) { return; }
      calcFields[fieldConfig.field.name] = calcs;
    }
  }
}

function findFormulas(
  calcFields: CalcFields,
  type: FormulaType,
  contentTypeItemService: ContentTypeItemService,
  lang: string,
  defaultLang: string,
) {
  const formulas: FieldFormulas = {};
  for (const [fieldName, calcItemGuids] of Object.entries(calcFields)) {
    for (const calcItemGuid of calcItemGuids) {
      contentTypeItemService.getContentTypeItemByGuid(calcItemGuid).pipe(take(1)).subscribe(calcItem => {
        const target = LocalizationHelper.getBestValue(calcItem.attributes.Target, lang, defaultLang)?.value;
        if (target !== type) { return; }

        const formula = LocalizationHelper.getBestValue(calcItem.attributes.Formula, lang, defaultLang)?.value;
        if (!formula) { return; }

        formulas[fieldName] = formula;
      });
    }
  }
  if (!Object.keys(formulas).length) { return; }
  return formulas;
}
