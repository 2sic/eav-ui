import { Injectable, OnDestroy } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldsProps, FormulaContext, FormulaCtxField, FormulaErrorCounter, FormulaType, FormulaTypes, TranslationState } from '../models';
import { EavContentTypeAttribute, EavEntity } from '../models/eav';
import { ContentTypeItemService, ContentTypeService, InputTypeService, ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsProps$: BehaviorSubject<FieldsProps>;
  private forceSettings$: BehaviorSubject<void>;
  private subscription: Subscription;
  private valueFormulaCounter = 0;
  private maxValueFormulaCycles = 5;
  private formulaErrorCounters: FormulaErrorCounter[] = [];
  private maxFormulaErrors = 10;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private languageService: LanguageService,
    private formulaDesignerService: FormulaDesignerService,
  ) { }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceSettings$?.complete();
    this.subscription?.unsubscribe();
  }

  init(entityGuid: string): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject(null);
    this.fieldsProps$ = new BehaviorSubject(null);
    this.forceSettings$ = new BehaviorSubject(null);

    const item = this.itemService.getItem(entityGuid);
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const itemHeader$ = this.itemService.getItemHeader$(entityGuid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, itemHeader$, currentLanguage$, defaultLanguage$]).pipe(
        map(([contentType, itemHeader, currentLanguage, defaultLanguage]) => {
          const ctSettings = FieldsSettingsHelpers.mergeSettings<ContentTypeSettings>(
            contentType.Metadata, currentLanguage, defaultLanguage,
          );
          ctSettings.Description ??= '';
          ctSettings.EditInstructions ??= '';
          ctSettings.Label ??= '';
          ctSettings.ListInstructions ??= '';
          ctSettings.Notes ??= '';
          ctSettings.Icon ??= '';
          ctSettings.Link ??= '';
          ctSettings._itemTitle = FieldsSettingsHelpers.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
          ctSettings._slotCanBeEmpty = itemHeader.Group?.SlotCanBeEmpty ?? false;
          ctSettings._slotIsEmpty = itemHeader.Group?.SlotIsEmpty ?? false;
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
      })
    );

    const itemAttributes$ = this.itemService.getItemAttributes$(entityGuid);
    const inputTypes$ = this.inputTypeService.getInputTypes$();
    this.subscription.add(
      combineLatest([
        combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, itemHeader$, inputTypes$]),
        combineLatest([this.forceSettings$]),
      ]).pipe(
        map(([
          [contentType, currentLanguage, defaultLanguage, itemAttributes, itemHeader, inputTypes],
          [forceSettings],
        ]) => {
          const formValues: FormValues = {};
          for (const [fieldName, fieldValues] of Object.entries(itemAttributes)) {
            formValues[fieldName] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, fieldValues, null);
          }

          const fieldsProps: FieldsProps = {};
          const formulaUpdates: FormValues = {};
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default has no value
            const value = formValues[attribute.Name];
            // custom-default has no inputType
            const inputType = inputTypes.find(i => i.Type === attribute.InputType);

            const merged = FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, currentLanguage, defaultLanguage);
            // update @All settings
            merged.Name ??= '';
            merged.Placeholder ??= '';
            merged.Notes ??= '';
            merged.VisibleInEditUI ??= true;
            merged.Required ??= false;
            merged.Disabled ??= false;
            merged.DisableTranslation ??= false;
            // formulas - visible, required, enabled
            const context = this.getFormulaContext(entityGuid, attribute.Name, formValues, contentType.Attributes, inputType, merged);
            const formulaItems = this.contentTypeItemService.getContentTypeItems(merged.Calculations);
            const formulaVisible = this.runFormula(entityGuid, attribute.Name, FormulaTypes.Visible, context, formulaItems);
            merged.VisibleInEditUI = formulaVisible === false ? false : merged.VisibleInEditUI;
            const formulaRequired = this.runFormula(entityGuid, attribute.Name, FormulaTypes.Required, context, formulaItems);
            merged.Required = formulaRequired === true ? true : merged.Required;
            const formulaEnabled = this.runFormula(entityGuid, attribute.Name, FormulaTypes.Enabled, context, formulaItems);
            merged.Disabled = formulaEnabled === false ? true : merged.Disabled;
            // special fixes
            merged.Name = merged.Name || attribute.Name;
            merged.Required = ValidationHelper.isRequired(merged);
            const slotIsEmpty = itemHeader.Group?.SlotCanBeEmpty && itemHeader.Group?.SlotIsEmpty;
            merged.DisableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              inputType, attributeValues, defaultLanguage, attribute.Metadata,
            );
            merged.DisableTranslation = slotIsEmpty || merged.DisableTranslation;
            merged.Disabled = slotIsEmpty || merged.Disabled;
            merged.Disabled = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, merged.DisableTranslation, currentLanguage, defaultLanguage,
            ) || merged.Disabled;
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(merged, value) ?? merged;

            // formulas - value
            const formulaValue = this.runFormula(entityGuid, attribute.Name, FormulaTypes.Value, context, formulaItems);
            // important to compare with undefined because null is allowed value
            if (value !== undefined && formulaValue !== undefined) {
              let valuesNotEqual = value !== formulaValue;
              // do a more in depth comparisson in case of calculated entity fields
              if (valuesNotEqual && Array.isArray(value) && Array.isArray(formulaValue)) {
                valuesNotEqual = !GeneralHelpers.arraysEqual(value as string[], formulaValue as string[]);
              }
              if (!fixed.Disabled && valuesNotEqual) {
                formulaUpdates[attribute.Name] = formulaValue;
              }
            }

            const validators = ValidationHelper.getValidators(fixed, attribute);
            const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
            const wrappers = InputFieldHelpers.getWrappers(fixed, calculatedInputType);
            const initialSettings = FieldsSettingsHelpers.mergeSettings<FieldSettings>(
              attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage,
            );
            const initialDisabled = initialSettings.Disabled ?? false;
            const fieldTranslation = FieldsSettingsHelpers.getTranslationState(
              attributeValues, fixed.DisableTranslation, currentLanguage, defaultLanguage,
            );

            fieldsProps[attribute.Name] = {
              calculatedInputType,
              constants: {
                angularAssets: inputType?.AngularAssets,
                contentTypeId,
                entityGuid,
                fieldName: attribute.Name,
                index: contentType.Attributes.indexOf(attribute),
                initialDisabled,
                inputType: calculatedInputType.inputType,
                isExternal: calculatedInputType.isExternal,
                isLastInGroup: FieldsSettingsHelpers.findIsLastInGroup(contentType, attribute),
                type: attribute.Type,
              },
              settings: fixed,
              translationState: fieldTranslation,
              validators,
              value,
              wrappers,
            };
          }

          if (Object.keys(formulaUpdates).length > 0 && this.maxValueFormulaCycles > this.valueFormulaCounter) {
            this.valueFormulaCounter++;
            this.itemService.updateItemAttributesValues(entityGuid, formulaUpdates, currentLanguage, defaultLanguage);
            return;
          }
          this.valueFormulaCounter = 0;
          return fieldsProps;
        }),
        filter(fieldsProps => !!fieldsProps),
      ).subscribe(fieldsProps => {
        this.fieldsProps$.next(fieldsProps);
      })
    );
  }

  getContentTypeSettings(): ContentTypeSettings {
    return this.contentTypeSettings$.value;
  }

  getContentTypeSettings$(): Observable<ContentTypeSettings> {
    return this.contentTypeSettings$.asObservable();
  }

  getFieldsProps(): FieldsProps {
    return this.fieldsProps$.value;
  }

  getFieldsProps$(): Observable<FieldsProps> {
    return this.fieldsProps$.asObservable();
  }

  getFieldSettings(fieldName: string): FieldSettings {
    return this.fieldsProps$.value[fieldName].settings;
  }

  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  getFieldValidation$(fieldName: string): Observable<ValidatorFn[]> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].validators),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
  }

  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
  }

  forceSettings(): void {
    this.forceSettings$.next();
  }

  private getFormulaContext(
    entityGuid: string,
    fieldName: string,
    formValues: FormValues,
    ctAttributes: EavContentTypeAttribute[],
    inputType: InputType,
    settings: FieldSettings,
  ): FormulaContext {
    const languageKey = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const languages = this.languageService.getLanguages();
    const languageName = languages.find(l => l.key === languageKey)?.name;
    const item = this.itemService.getItem(entityGuid);

    const fields: Record<string, FormulaCtxField> = {};
    for (const [name, value] of Object.entries(formValues)) {
      fields[name] = {
        name,
        type: ctAttributes.find(a => a.Name === name)?.Type,
        value,
      };
    }

    const context: FormulaContext = {
      culture: {
        code: languageKey,
        name: languageName,
      },
      entity: {
        guid: item.Entity.Guid,
        id: item.Entity.Id,
      },
      field: {
        name: fieldName,
        type: ctAttributes.find(a => a.Name === fieldName)?.Type,
        value: formValues[fieldName],
      },
      fields,
      value: {
        current: formValues[fieldName],
        get default() {
          return InputFieldHelpers.parseDefaultValue(fieldName, inputType, settings, item.Header);
        },
      },
    };
    return context;
  }

  private runFormula(
    entityGuid: string,
    fieldName: string,
    type: FormulaType,
    context: FormulaContext,
    formulaItems: EavEntity[],
  ): FieldValue {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const customFormula = this.formulaDesignerService.getFormula(entityGuid, fieldName, type);
    if (customFormula) {
      try {
        const formulaFn = FormulaHelpers.buildFormulaFunction(customFormula);
        const value = formulaFn(context);
        this.formulaDesignerService.upsertFormulaResult(entityGuid, fieldName, type, value, false);
        return value;
      } catch (error) {
        console.error(`Error while calculating designed formula "${type}" for field "${context.field.name}"`, error);
        this.formulaDesignerService.upsertFormulaResult(entityGuid, fieldName, type, undefined, true);
      }
      return;
    }

    const formulaItem = formulaItems.find(item => {
      const target: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, item.Attributes.Target, null);
      return target === type;
    });
    if (formulaItem == null) { return; }

    const formula = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
    if (formula == null) { return; }

    const counter = this.formulaErrorCounters.find(c => c.entityGuid === entityGuid && c.fieldName === fieldName && c.type === type);
    if (counter?.count >= this.maxFormulaErrors) { return; }

    try {
      const formulaFn = FormulaHelpers.buildFormulaFunction(formula);
      const value = formulaFn(context);
      return value;
    } catch (error) {
      if (!counter) {
        const newCounter: FormulaErrorCounter = {
          count: 1,
          entityGuid,
          fieldName,
          type,
        };
        this.formulaErrorCounters.push(newCounter);
        return;
      }

      counter.count++;
      if (counter.count >= this.maxFormulaErrors) {
        const ctSettings = this.getContentTypeSettings();
        console.error(`Error while calculating formula "${type}" for field "${fieldName}" for entity "${ctSettings._itemTitle}". It will now be ignored.\n\n`, error);
      }
    }
  }
}
