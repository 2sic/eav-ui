import { Injectable, OnDestroy } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { FieldsSettingsHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { ContentTypeSettings, FieldsProps, TranslationState } from '../models';
import { EavItem } from '../models/eav';
import { ContentTypeService, InputTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';

@Injectable()
export class FieldsSettingsService implements OnDestroy {
  private contentTypeSettings$: BehaviorSubject<ContentTypeSettings>;
  private fieldsProps$: BehaviorSubject<FieldsProps>;
  private subscription: Subscription;

  constructor(
    private contentTypeService: ContentTypeService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
  ) { }

  ngOnDestroy(): void {
    this.contentTypeSettings$?.complete();
    this.fieldsProps$?.complete();
    this.subscription?.unsubscribe();
  }

  init(item: EavItem): void {
    this.subscription = new Subscription();
    this.contentTypeSettings$ = new BehaviorSubject<ContentTypeSettings>(null);
    this.fieldsProps$ = new BehaviorSubject<FieldsProps>(null);

    const contentTypeId = InputFieldHelpers.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const itemHeader$ = this.itemService.getItemHeader$(item.Entity.Guid);
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

    const itemAttributes$ = this.itemService.getItemAttributes$(item.Entity.Guid);
    const inputTypes$ = this.inputTypeService.getInputTypes$();
    this.subscription.add(
      combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, itemHeader$, inputTypes$]).pipe(
        map(([contentType, currentLanguage, defaultLanguage, itemAttributes, itemHeader, inputTypes]) => {
          const fieldsProps: FieldsProps = {};
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default value is null
            const value = LocalizationHelpers.translate(currentLanguage, defaultLanguage, attributeValues, null);
            // custom-default inputType is null
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
            // special fixes
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
                entityGuid: item.Entity.Guid,
                entityId: item.Entity.Id,
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
          return fieldsProps;
        }),
      ).subscribe(fieldsProps => {
        this.fieldsProps$.next(fieldsProps);
      })
    );
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

  getFieldSettings$(fieldName: string): Observable<FieldSettings> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].settings),
      distinctUntilChanged((oldSettings, newSettings) => {
        const equal = FieldsSettingsHelpers.settingsEqual(oldSettings, newSettings);
        return equal;
      }),
    );
  }

  getFieldValidation$(fieldName: string): Observable<ValidatorFn[]> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].validators),
      distinctUntilChanged((oldValidators, newValidators) => {
        const equal = FieldsSettingsHelpers.validatorsEqual(oldValidators, newValidators);
        return equal;
      }),
    );
  }

  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged((oldTranslationState, newTranslationState) => {
        const equal = FieldsSettingsHelpers.translationStateEqual(oldTranslationState, newTranslationState);
        return equal;
      }),
    );
  }
}
