import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { LocalizationHelper } from '../helpers/localization-helper';
import { CalcFields, FieldFormulas, FieldsFormulaSettings, FormulaType, LanguageChangeCheckedFields } from '../models';
import { EavAttributes } from '../models/eav';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { FormulaContext, FormulaFunction } from '../store/ngrx-data/item.models';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FormulaInstanceService implements OnDestroy {
  private form: FormGroup;
  private entityGuid: string;
  private lang: string;
  private defaultLang: string;
  private fieldConfigs: FieldConfigSet[];
  private fieldsFormulaSettings$: Subject<FieldsFormulaSettings>;
  private languageChangeCheckedFields: LanguageChangeCheckedFields;
  private subscription: Subscription;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private contentTypeItemService: ContentTypeItemService,
    private itemService: ItemService,
  ) { }

  ngOnDestroy() {
    this.fieldsFormulaSettings$.complete();
    this.subscription.unsubscribe();
  }

  init(formId: number, form: FormGroup, entityGuid: string, fieldConfigs: FieldConfigSet[]) {
    this.form = form;
    this.entityGuid = entityGuid;
    this.fieldConfigs = fieldConfigs;
    this.fieldsFormulaSettings$ = new Subject<FieldsFormulaSettings>();
    this.languageChangeCheckedFields = {};
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

  runSettingsFormulas() {
    return;
    angularConsoleLog('Run settings formulas');
    let eavAttributes: EavAttributes;
    this.itemService.selectItemAttributes(this.entityGuid).pipe(take(1)).subscribe(eavAttrs => {
      eavAttributes = eavAttrs;
    });
    const formValues = this.getFormValues(eavAttributes);
    const formulaHidden = this.formulaHidden(formValues);
    const formulaRequired = this.formulaRequired(formValues);
    const formulaDisabled = this.formulaDisabled(formValues);

    const newSettings: FieldsFormulaSettings = {};
    for (const attribute of Object.keys(eavAttributes)) {
      newSettings[attribute] = {
        hidden: formulaHidden.includes(attribute),
        required: formulaRequired.includes(attribute),
        disabled: formulaDisabled.includes(attribute),
      };
    }
    this.fieldsFormulaSettings$.next(newSettings);
  }

  getSettings(fieldName: string) {
    return this.fieldsFormulaSettings$.pipe(map(settings => settings[fieldName]));
  }

  runValueFormulas() {
    return;
    angularConsoleLog('Run value formulas');
    const formulas = this.findFieldFormulas('value', true);
    if (formulas == null) { return; }

    let eavAttributes: EavAttributes;
    this.itemService.selectItemAttributes(this.entityGuid).pipe(take(1)).subscribe(eavAttrs => {
      eavAttributes = eavAttrs;
    });

    const oldValues = this.getFormValues(eavAttributes);
    const newValues: FormValues = {};
    for (const [fieldName, formulaFn] of Object.entries(formulas)) {
      const oldValue = oldValues[fieldName];
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: oldValue,
          form: oldValues,
        }
      };
      const newValue = formulaFn(context);

      if (oldValue !== newValue) {
        newValues[fieldName] = newValue;
        this.form.controls[fieldName].markAsTouched();
        this.form.controls[fieldName].markAsDirty();
      }
    }
    if (!Object.keys(newValues).length) { return; }
    this.itemService.updateItemAttributesValues(this.entityGuid, newValues, this.lang, this.defaultLang);
  }

  private formulaHidden(formValues: FormValues) {
    const formulas = this.findFieldFormulas('visible', false);
    if (formulas == null) { return []; }

    const newHidden: string[] = [];
    for (const [fieldName, formulaFn] of Object.entries(formulas)) {
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: formValues[fieldName],
          form: formValues,
        }
      };
      const isVisible = formulaFn(context);
      if (isVisible) { continue; }

      newHidden.push(fieldName);
    }
    return newHidden;
  }

  private formulaRequired(formValues: FormValues) {
    const formulas = this.findFieldFormulas('required', false);
    if (formulas == null) { return []; }

    const newRequired: string[] = [];
    for (const [fieldName, formulaFn] of Object.entries(formulas)) {
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: formValues[fieldName],
          form: formValues,
        }
      };
      const isRequired = formulaFn(context);
      if (!isRequired) { continue; }

      newRequired.push(fieldName);
    }
    return newRequired;
  }

  private formulaDisabled(formValues: FormValues) {
    const formulas = this.findFieldFormulas('enabled', false);
    if (formulas == null) { return []; }

    const newDisabled: string[] = [];
    for (const [fieldName, formulaFn] of Object.entries(formulas)) {
      const context: FormulaContext = {
        data: {
          name: fieldName,
          value: formValues[fieldName],
          form: formValues,
        }
      };
      const isEnabled = formulaFn(context);
      if (isEnabled) { continue; }

      newDisabled.push(fieldName);
    }
    return newDisabled;
  }

  /** Runs formulas on language change after field configurations were translated */
  runFormulasAfterFieldsTranslated() {
    let eavAttributes: EavAttributes;
    this.itemService.selectItemAttributes(this.entityGuid).pipe(take(1)).subscribe(eavAttrs => {
      eavAttributes = eavAttrs;
    });
    this.languageChangeCheckedFields = {};
    for (const attribute of Object.keys(eavAttributes)) {
      this.languageChangeCheckedFields[attribute] = false;
    }
  }

  /** Notifies that field configuration was translated on language change */
  fieldTranslated(attribute: string) {
    const attributes = Object.keys(this.languageChangeCheckedFields);
    if (!attributes.length || !attributes.includes(attribute)) { return; }

    this.languageChangeCheckedFields[attribute] = true;
    const allChecked = !Object.entries(this.languageChangeCheckedFields).some(([attr, isChecked]) => !isChecked);
    if (!allChecked) { return; }

    this.languageChangeCheckedFields = {};
    this.runSettingsFormulas();
    this.runValueFormulas();
  }

  private findFieldFormulas(type: FormulaType, filterDisabledFields: boolean) {
    const calcFields: CalcFields = {};
    this.findFieldsWithCalcs(calcFields, this.fieldConfigs, filterDisabledFields);
    const formulas = this.findFormulaFns(calcFields, type);
    return formulas;
  }

  private findFieldsWithCalcs(calcFields: CalcFields, fieldConfigs: FieldConfigSet[], filterDisabledFields: boolean) {
    for (const fieldConfig of fieldConfigs) {
      const fieldConfigGroup = fieldConfig.field as FieldConfigGroup;
      if (fieldConfigGroup.fieldGroup != null) {
        this.findFieldsWithCalcs(calcFields, fieldConfigGroup.fieldGroup, filterDisabledFields);
      } else {
        if (filterDisabledFields) {
          const disabled = this.form.controls[fieldConfig.field.name].disabled;
          if (disabled) { continue; }
        }
        const calcs = fieldConfig.field.settings$.value.Calculations;
        if (calcs == null || !calcs.length) { continue; }
        calcFields[fieldConfig.field.name] = calcs;
      }
    }
  }

  private findFormulaFns(calcFields: CalcFields, type: FormulaType) {
    const formulas: FieldFormulas = {};
    for (const [fieldName, calcItemGuids] of Object.entries(calcFields)) {
      for (const calcItemGuid of calcItemGuids) {
        this.contentTypeItemService.getContentTypeItemByGuid(calcItemGuid).pipe(take(1)).subscribe(calcItem => {
          const target: string = LocalizationHelper.translate(this.lang, this.defaultLang, calcItem.Attributes.Target, null);
          if (target !== type) { return; }

          const formula: string = LocalizationHelper.translate(this.lang, this.defaultLang, calcItem.Attributes.Formula, null);
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
