import { Injectable, OnDestroy } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { EavService, LoggingService } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { FieldsSettingsHelpers, FormulaHelpers, GeneralHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
// tslint:disable-next-line:max-line-length
import { ContentTypeSettings, FieldsProps, FormulaFunctionDefault, FormulaTarget, FormulaTargets, FormulaVersions, LogSeverities, RunFormulasResult, SettingsFormulaPrefix, TranslationState } from '../models';
import { EavHeader } from '../models/eav';
import { ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService } from '../store/ngrx-data';
import { FormulaDesignerService } from './formula-designer.service';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsProps$: BehaviorSubject<FieldsProps>;
  private forceSettings$: BehaviorSubject<void>;
  private subscription: Subscription;
  private valueFormulaCounter = 0;
  private maxValueFormulaCycles = 5;
  private formulaSettingsCache$: BehaviorSubject<Record<string, FieldSettings>>;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private languageService: LanguageService,
    private formulaDesignerService: FormulaDesignerService,
    private loggingService: LoggingService,
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
  ) { }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.forceSettings$?.complete();
    this.formulaSettingsCache$?.complete();
    this.subscription?.unsubscribe();
  }

  init(entityGuid: string): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject(null);
    this.fieldsProps$ = new BehaviorSubject(null);
    this.forceSettings$ = new BehaviorSubject(null);
    this.formulaSettingsCache$ = new BehaviorSubject(null);

    const item = this.itemService.getItem(entityGuid);
    const entityId = item.Entity.Id;
    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const itemHeader$ = this.itemService.getItemHeader$(entityGuid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, itemHeader$, currentLanguage$, defaultLanguage$]).pipe(
        map(([contentType, itemHeader, currentLanguage, defaultLanguage]) => {
          const ctSettings = FieldsSettingsHelpers.setDefaultContentTypeSettings(
            FieldsSettingsHelpers.mergeSettings<ContentTypeSettings>(contentType.Metadata, currentLanguage, defaultLanguage),
            contentType,
            currentLanguage,
            defaultLanguage,
            itemHeader,
          );
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

            const merged = FieldsSettingsHelpers.setDefaultFieldSettings(
              FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, defaultLanguage, defaultLanguage),
            );

            // run formulas
            const formulaResult = this.runFormulas(entityGuid, entityId, attribute.Name, formValues, inputType, merged, itemHeader);
            const calculated = formulaResult.settings;
            const formulaValue = formulaResult.value;

            // special fixes
            calculated.Name = calculated.Name || attribute.Name;
            calculated.Required = ValidationHelper.isRequired(calculated);
            calculated.DisableTranslation = FieldsSettingsHelpers.findDisableTranslation(
              inputType, attributeValues, defaultLanguage, attribute.Metadata,
            );
            const slotIsEmpty = itemHeader.Group?.SlotCanBeEmpty && itemHeader.Group?.SlotIsEmpty;
            calculated.DisableTranslation = slotIsEmpty || calculated.DisableTranslation;
            calculated.Disabled = slotIsEmpty || calculated.Disabled;
            const disabledBecauseTranslations = FieldsSettingsHelpers.getDisabledBecauseTranslations(
              attributeValues, calculated.DisableTranslation, currentLanguage, defaultLanguage,
            );
            calculated.Disabled = disabledBecauseTranslations || calculated.Disabled;
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(calculated, value) ?? calculated;

            // important to compare with undefined because null is allowed value
            if (!slotIsEmpty && !disabledBecauseTranslations && value !== undefined && formulaValue !== undefined) {
              let valuesNotEqual = value !== formulaValue;
              // do a more in depth comparisson in case of calculated entity fields
              if (valuesNotEqual && Array.isArray(value) && Array.isArray(formulaValue)) {
                valuesNotEqual = !GeneralHelpers.arraysEqual(value as string[], formulaValue as string[]);
              }
              if (valuesNotEqual) {
                formulaUpdates[attribute.Name] = formulaValue;
              }
            }

            const validators = ValidationHelper.getValidators(fixed, attribute);
            const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
            const wrappers = InputFieldHelpers.getWrappers(fixed, calculatedInputType);
            const initialSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
              FieldsSettingsHelpers.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage),
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

  private runFormulas(
    entityGuid: string,
    entityId: number,
    fieldName: string,
    formValues: FormValues,
    inputType: InputType,
    settings: FieldSettings,
    itemHeader: EavHeader,
  ): RunFormulasResult {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const cached = FormulaHelpers.parseFormulaCache(fieldName, currentLanguage, defaultLanguage, this.formulaSettingsCache$.value);
    const previousSettings: FieldSettings = {
      ...settings,
      ...cached,
    };

    const formulasForSettings = this.formulaDesignerService.getFormulas(entityGuid, fieldName, null, false)
      .filter(formula => formula.target.startsWith(SettingsFormulaPrefix));
    const formulaSettings: Record<string, any> = {};
    for (const formula of formulasForSettings) {
      const settingName = formula.target.substring(SettingsFormulaPrefix.length);

      const defaultSetting = (settings as Record<string, any>)[settingName];
      const formulaSetting = this.runFormula(
        entityGuid, entityId, fieldName, formula.target, formValues, inputType, settings, previousSettings, itemHeader,
      );

      if (formulaSetting === undefined) { continue; }

      if (defaultSetting == null || formulaSetting == null) {
        // can't check types, hope for the best
        formulaSettings[settingName] = formulaSetting;
        continue;
      }

      if (Array.isArray(defaultSetting) && Array.isArray(formulaSetting)) {
        // can't check types of items in array, hope for the best
        formulaSettings[settingName] = formulaSetting;
        continue;
      }

      if (typeof defaultSetting === typeof formulaSetting) {
        // maybe typesafe
        formulaSettings[settingName] = formulaSetting;
        continue;
      }
    }

    const newSettingsCache = FormulaHelpers.encodeFormulaCache(
      fieldName, currentLanguage, defaultLanguage, formulaSettings as FieldSettings, this.formulaSettingsCache$.value,
    );
    this.formulaSettingsCache$.next(newSettingsCache);

    const formulaValue = this.runFormula(
      entityGuid, entityId, fieldName, FormulaTargets.Value, formValues, inputType, settings, previousSettings, itemHeader,
    );

    const formulaResult: RunFormulasResult = {
      settings: {
        ...settings,
        ...formulaSettings,
      },
      value: formulaValue,
    };
    return formulaResult;
  }

  private runFormula(
    entityGuid: string,
    entityId: number,
    fieldName: string,
    target: FormulaTarget,
    formValues: FormValues,
    inputType: InputType,
    settings: FieldSettings,
    previousSettings: FieldSettings,
    itemHeader: EavHeader,
  ): FieldValue {
    const formula = this.formulaDesignerService.getFormula(entityGuid, fieldName, target, false);
    if (formula == null) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const languages = this.languageService.getLanguages();
    const debugEnabled = this.globalConfigService.getDebugEnabled();
    const formulaProps = FormulaHelpers.buildFormulaProps(
      formula,
      entityGuid,
      entityId,
      inputType,
      settings,
      previousSettings,
      formValues,
      currentLanguage,
      languages,
      itemHeader,
      debugEnabled,
    );
    const designerState = this.formulaDesignerService.getDesignerState();
    const isOpenInDesigner = designerState.isOpen
      && designerState.entityGuid === entityGuid
      && designerState.fieldName === fieldName
      && designerState.target === target;
    const ctSettings = this.getContentTypeSettings();
    try {
      switch (formula.version) {
        case FormulaVersions.V1:
          if (isOpenInDesigner) {
            console.log(`Running formula${FormulaVersions.V1.toLocaleUpperCase()} for Entity: "${ctSettings._itemTitle}", Field: "${fieldName}", Target: "${target}" with following arguments:`, formulaProps);
          }
          const valueV1 = formula.fn(formulaProps.data, formulaProps.context);
          this.formulaDesignerService.upsertFormulaResult(entityGuid, fieldName, target, valueV1, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueV1);
          }
          return valueV1;
        default:
          if (isOpenInDesigner) {
            console.log(`Running formula for Entity: "${ctSettings._itemTitle}", Field: "${fieldName}", Target: "${target}" with following arguments:`, undefined);
          }
          const valueDefault = (formula.fn as FormulaFunctionDefault)();
          this.formulaDesignerService.upsertFormulaResult(entityGuid, fieldName, target, valueDefault, false);
          if (isOpenInDesigner) {
            console.log('Formula result:', valueDefault);
          }
          return valueDefault;
      }
    } catch (error) {
      const errorLabel = `Error in formula calculation for Entity: "${ctSettings._itemTitle}", Field: "${fieldName}", Target: "${target}"`;
      this.formulaDesignerService.upsertFormulaResult(entityGuid, fieldName, target, undefined, true);
      this.loggingService.addLog(LogSeverities.Error, errorLabel, error);
      if (isOpenInDesigner) {
        console.error(errorLabel, error);
      } else {
        this.loggingService.showMessage(this.translate.instant('Errors.FormulaCalculation'), 2000);
      }
    }
  }
}
