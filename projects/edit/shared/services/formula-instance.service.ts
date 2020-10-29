import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { LocalizationHelper } from '../helpers/localization-helper';
import { EavAttributes } from '../models/eav';
import { CalcFields, FieldFormulas, FormulaType, LanguageChangeDisabledChecked } from '../models/formula.models';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { FormulaContext, FormulaFunction } from '../store/ngrx-data/item.models';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FormulaInstanceService implements OnDestroy {
  form: FormGroup;
  entityGuid: string;
  lang = '';
  defaultLang = '';
  runCalculationsAfterLanguageChangeDisabledCheck$ = new Subject<void>();
  private formulaHidden$ = new BehaviorSubject<string[]>([]);
  private fieldConfigs: FieldConfigSet[];
  private languageChangeDisabledChecked: LanguageChangeDisabledChecked = {};
  private subscription: Subscription;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private contentTypeItemService: ContentTypeItemService,
    private itemService: ItemService,
  ) { }

  ngOnDestroy() {
    this.runCalculationsAfterLanguageChangeDisabledCheck$.complete();
    this.formulaHidden$.complete();
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

  findFieldFormulas(type: FormulaType, ignoreDisabledFields = false) {
    const calcFields: CalcFields = {};
    this.findFieldsWithCalcs(calcFields, this.fieldConfigs, ignoreDisabledFields);
    const formulas = this.findFormulas(calcFields, type);
    return formulas;
  }

  runValueFormulas(newEavAttributes: EavAttributes) {
    const formulas = this.findFieldFormulas('value');
    if (formulas == null) { return; }

    let changed = false;
    const formValues = this.getFormValues(newEavAttributes);
    for (const [fieldName, formulaFn] of Object.entries(formulas)) {
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: formValues[fieldName],
          form: formValues,
        }
      };
      const newValue = formulaFn(context);

      const eavValue = LocalizationHelper.getBestValue(newEavAttributes[fieldName], this.lang, this.defaultLang);
      if (eavValue.value !== newValue) {
        eavValue.value = newValue;
        this.form.controls[fieldName].markAsTouched();
        this.form.controls[fieldName].markAsDirty();
        changed = true;
      }
    }
    return changed;
  }

  runVisibleFormulas() {
    const formulas = this.findFieldFormulas('visible', true);
    if (formulas == null) {
      this.formulaHidden$.next([]);
      return;
    }

    const formulaHidden: string[] = [];
    let eavAtributes: EavAttributes;
    this.itemService.selectAttributesByEntityGuid(this.entityGuid).pipe(take(1)).subscribe(attrs => {
      eavAtributes = attrs;
    });
    const formValues = this.getFormValues(eavAtributes);
    for (const attribute of Object.keys(formulas)) {
      const formulaFn = formulas[attribute];
      if (formulaFn == null) { continue; }

      const context: FormulaContext = {
        data: {
          name: attribute,
          value: formValues[attribute],
          form: formValues,
        }
      };
      const visible = formulaFn(context);
      if (visible) { continue; }
      formulaHidden.push(attribute);
    }

    this.formulaHidden$.next(formulaHidden);
  }

  getFormulaHidden(fieldName: string) {
    return this.formulaHidden$.pipe(map(hiddenFields => hiddenFields.includes(fieldName)));
  }

  clearLanguageChangeDisabledChecked(eavAttributes: EavAttributes) {
    this.languageChangeDisabledChecked = {};
    for (const attribute of Object.keys(eavAttributes)) {
      this.languageChangeDisabledChecked[attribute] = false;
    }
  }

  languageChangeDisabledIsChecked(attribute: string) {
    const attributes = Object.keys(this.languageChangeDisabledChecked);
    if (!attributes.length || !attributes.includes(attribute)) { return; }

    this.languageChangeDisabledChecked[attribute] = true;
    const allChecked = !Object.entries(this.languageChangeDisabledChecked).some(([attr, isChecked]) => !isChecked);
    if (!allChecked) { return; }

    this.languageChangeDisabledChecked = {};
    this.runCalculationsAfterLanguageChangeDisabledCheck$.next();
  }

  private findFieldsWithCalcs(calcFields: CalcFields, configsGroup: FieldConfigSet[], ignoreDisabledFields: boolean) {
    for (const fieldConfig of configsGroup) {
      const fieldConfigGroup = fieldConfig.field as FieldConfigGroup;
      if (fieldConfigGroup.fieldGroup != null) {
        this.findFieldsWithCalcs(calcFields, fieldConfigGroup.fieldGroup, ignoreDisabledFields);
      } else {
        if (!ignoreDisabledFields) {
          const disabled = this.form.controls[fieldConfig.field.name].disabled;
          if (disabled) { continue; }
        }
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
          const target: string = LocalizationHelper.getBestValue(calcItem.attributes.Target, this.lang, this.defaultLang)?.value;
          if (target !== type) { return; }

          const formula: string = LocalizationHelper.getBestValue(calcItem.attributes.Formula, this.lang, this.defaultLang)?.value;
          if (!formula) { return; }

          const formulaFn = this.buildFormulaFunction(formula);
          formulas[fieldName] = formulaFn;
        });
      }
    }
    if (!Object.keys(formulas).length) { return; }
    return formulas;
  }

  private buildFormulaFunction(formula: string): FormulaFunction {
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
    const formulaFn: FormulaFunction = new Function('return ' + cleanFormula)();
    return formulaFn;
  }

  private getFormValues(attributes: EavAttributes) {
    const formValues: FormValues = {};

    for (const [name, attribute] of Object.entries(attributes)) {
      formValues[name] = LocalizationHelper.translate(this.lang, this.defaultLang, attribute, null);
    }

    return formValues;
  }
}
