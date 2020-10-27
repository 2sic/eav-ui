import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { LocalizationHelper } from '../helpers/localization-helper';
import { EavAttributes } from '../models/eav';
import { CalcFields, FieldFormulas, FormulaType } from '../models/formula.models';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { FormulaContext, FormulaFunction } from '../store/ngrx-data/item.models';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FormulaInstanceService implements OnDestroy {
  form: FormGroup;
  entityGuid: string;
  lang = '';
  defaultLang = '';
  private fieldConfigs: FieldConfigSet[];
  private subscription: Subscription;

  constructor(private languageInstanceService: LanguageInstanceService, private contentTypeItemService: ContentTypeItemService) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  init(formId: number, form: FormGroup, entityGuid: string, fieldConfigs: FieldConfigSet[]) {
    this.form = form;
    this.entityGuid = entityGuid;
    this.fieldConfigs = fieldConfigs;
    this.subscription = new Subscription();

    this.subscription.add(
      this.languageInstanceService.getDefaultLanguage(formId).subscribe(defaultLang => {
        this.defaultLang = defaultLang;
      })
    );

    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(formId).subscribe(currentLang => {
        this.lang = currentLang;
      })
    );
  }

  findFieldFormulas(type: FormulaType) {
    const calcFields: CalcFields = {};
    this.findFieldsWithCalcs(calcFields, this.fieldConfigs);
    const formulas = this.findFormulas(calcFields, type);
    return formulas;
  }

  runValueFormulas(attributes: EavAttributes) {
    const formulas = this.findFieldFormulas('value');
    if (formulas == null) { return; }

    for (const [fieldName, formula] of Object.entries(formulas)) {
      const cleanFormula = this.cleanFormulaVersions(formula);
      const formulaFn: FormulaFunction = new Function('return ' + cleanFormula)();

      const eavValue = LocalizationHelper.getBestValue(attributes[fieldName], this.lang, this.defaultLang);
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: eavValue.value,
          form: this.getFormValues(attributes),
        }
      };
      const newValue = formulaFn(context);
      eavValue.value = newValue;
    }
  }

  private findFieldsWithCalcs(calcFields: CalcFields, configsGroup: FieldConfigSet[]) {
    for (const fieldConfig of configsGroup) {
      const fieldConfigGroup = fieldConfig.field as FieldConfigGroup;
      if (fieldConfigGroup.fieldGroup != null) {
        this.findFieldsWithCalcs(calcFields, fieldConfigGroup.fieldGroup);
      } else {
        const disabled = this.form.controls[fieldConfig.field.name].disabled;
        if (disabled) { continue; }
        const calcs = fieldConfig.field.settings$.value.Calculations;
        if (calcs == null || !calcs.length) { continue; }
        calcFields[fieldConfig.field.name] = calcs;
      }
    }
  }

  private findFormulas(calcFields: CalcFields, type: FormulaType) {
    const formulas: FieldFormulas = {};
    for (const [fieldName, calcItemGuids] of Object.entries(calcFields)) {
      for (const calcItemGuid of calcItemGuids) {
        this.contentTypeItemService.getContentTypeItemByGuid(calcItemGuid).pipe(take(1)).subscribe(calcItem => {
          const target = LocalizationHelper.getBestValue(calcItem.attributes.Target, this.lang, this.defaultLang)?.value;
          if (target !== type) { return; }

          const formula = LocalizationHelper.getBestValue(calcItem.attributes.Formula, this.lang, this.defaultLang)?.value;
          if (!formula) { return; }

          formulas[fieldName] = formula;
        });
      }
    }
    if (!Object.keys(formulas).length) { return; }
    return formulas;
  }

  private cleanFormulaVersions(formula: string) {
    let cleanFormula = formula.trim();

    // V1 cleanup
    if (cleanFormula.startsWith('v1') || cleanFormula.startsWith('V1')) {
      if (cleanFormula.startsWith('v1')) {
        cleanFormula = cleanFormula.replace('v1', 'function');
      }
      if (cleanFormula.startsWith('V1')) {
        cleanFormula = cleanFormula.replace('V1', 'function');
      }
    }

    return cleanFormula;
  }

  private getFormValues(attributes: EavAttributes) {
    const formValues: FormValues = {};

    for (const [name, attribute] of Object.entries(attributes)) {
      formValues[name] = LocalizationHelper.translate(this.lang, this.defaultLang, attribute, null);
    }

    return formValues;
  }
}
