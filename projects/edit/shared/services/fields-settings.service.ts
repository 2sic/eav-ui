import { Injectable, OnDestroy } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { TranslateMenuHelpers } from '../../eav-material-controls/localization/translate-menu/translate-menu.helpers';
import { TranslationStateCore } from '../../eav-material-controls/localization/translate-menu/translate-menu.models';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { TranslationLinkConstants } from '../constants/translation-link.constants';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { ContentTypeSettings, FieldsProps, TranslationState } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavItem, EavValues } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

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

    const contentTypeId = InputFieldHelper.getContentTypeId(item);
    const contentType$ = this.contentTypeService.getContentType$(contentTypeId);
    const header$ = this.itemService.selectItemHeader(item.Entity.Guid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);

    this.subscription.add(
      combineLatest([contentType$, header$, currentLanguage$, defaultLanguage$]).pipe(
        map(([contentType, header, currentLanguage, defaultLanguage]) => {
          const ctSettings = this.mergeSettings<ContentTypeSettings>(contentType.Metadata, currentLanguage, defaultLanguage);
          ctSettings.Description ??= '';
          ctSettings.EditInstructions ??= '';
          ctSettings.Label ??= '';
          ctSettings.ListInstructions ??= '';
          ctSettings.Notes ??= '';
          ctSettings.Icon ??= '';
          ctSettings.Link ??= '';
          ctSettings._itemTitle = this.getContentTypeTitle(contentType, currentLanguage, defaultLanguage);
          ctSettings._slotCanBeEmpty = header.Group?.SlotCanBeEmpty ?? false;
          ctSettings._slotIsEmpty = header.Group?.SlotIsEmpty ?? false;
          return ctSettings;
        }),
      ).subscribe(ctSettings => {
        this.contentTypeSettings$.next(ctSettings);
      })
    );

    const itemAttributes$ = this.itemService.selectItemAttributes(item.Entity.Guid);
    const itemHeader$ = this.itemService.selectItemHeader(item.Entity.Guid);
    const inputTypes$ = this.inputTypeService.getInputTypes$();
    this.subscription.add(
      combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, itemHeader$, inputTypes$]).pipe(
        map(([contentType, currentLanguage, defaultLanguage, itemAttributes, itemHeader, inputTypes]) => {
          const fieldsProps: FieldsProps = {};
          for (const attribute of contentType.Attributes) {
            const attributeValues = itemAttributes[attribute.Name];
            // empty-default value is null
            const value = LocalizationHelper.translate(currentLanguage, defaultLanguage, attributeValues, null);
            // custom-default inputType is null
            const inputType = inputTypes.find(i => i.Type === attribute.InputType);

            const merged = this.mergeSettings<FieldSettings>(attribute.Metadata, currentLanguage, defaultLanguage);
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
            merged.DisableTranslation = this.findDisableTranslation(inputType, attributeValues, defaultLanguage, attribute.Metadata);
            merged.DisableTranslation = slotIsEmpty || merged.DisableTranslation;
            merged.Disabled = slotIsEmpty || merged.Disabled;
            merged.Disabled =
              getDisabledBecauseTranslations(attributeValues, merged.DisableTranslation, currentLanguage, defaultLanguage) ||
              merged.Disabled;
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(merged, value) ?? merged;

            const validators = ValidationHelper.getValidators(fixed, attribute);
            const calculatedInputType = InputFieldHelper.calculateInputType(attribute, inputTypes);
            const wrappers = InputFieldHelper.getWrappers(fixed, calculatedInputType);
            const initialSettings = this.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage);
            const initialDisabled = initialSettings.Disabled ?? false;
            const fieldTranslation = getTranslationState2New(attributeValues, fixed.DisableTranslation, currentLanguage, defaultLanguage);

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
                isLastInGroup: this.findIsLastInGroup(contentType, attribute),
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
        const equal = settingsEqual(oldSettings, newSettings);
        return equal;
      }),
    );
  }

  getFieldValidation$(fieldName: string): Observable<ValidatorFn[]> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].validators),
      distinctUntilChanged((oldValidators, newValidators) => {
        const equal = validatorsEqual(oldValidators, newValidators);
        return equal;
      }),
    );
  }

  getTranslationState$(fieldName: string): Observable<TranslationState> {
    return this.fieldsProps$.pipe(
      map(fieldsSettings => fieldsSettings[fieldName].translationState),
      distinctUntilChanged((oldTranslationState, newTranslationState) => {
        const equal = translationStateEqual(oldTranslationState, newTranslationState);
        return equal;
      }),
    );
  }

  private mergeSettings<T>(metadataItems: EavEntity[], currentLanguage: string, defaultLanguage: string): T {
    if (metadataItems == null) { return {} as T; }

    const merged: { [attributeName: string]: any } = {};
    // copy metadata settings which are not @All
    for (const item of metadataItems) {
      if (item.Type.Id === '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
        merged[name] = value;
      }
    }

    // copy @All metadata settings, overwriting previous settings
    for (const item of metadataItems) {
      if (item.Type.Id !== '@All') { continue; }

      for (const [name, values] of Object.entries(item.Attributes)) {
        const value = LocalizationHelper.translate(currentLanguage, defaultLanguage, values, null);
        // do not overwrite previous settings if @All is empty
        const exists = merged[name] != null;
        const emptyAll = value == null || value === '';
        if (exists && emptyAll) { continue; }

        merged[name] = value;
      }
    }

    return merged as T;
  }

  /** Find if DisableTranslation is true in any setting and in any language */
  private findDisableTranslation(
    inputType: InputType,
    attributeValues: EavValues<any>,
    defaultLanguage: string,
    metadataItems: EavEntity[],
  ): boolean {
    if (inputType?.DisableI18n) { return true; }
    if (!LocalizationHelper.translationExistsInDefault(attributeValues, defaultLanguage)) { return true; }
    if (metadataItems == null) { return false; }

    // find DisableTranslation in @All, @String, @string-default, etc...
    for (const item of metadataItems) {
      const eavValues = item.Attributes['DisableTranslation'];
      if (eavValues == null) { continue; }

      // if true in any language, it is true for all cases
      for (const eavValue of eavValues.Values) {
        if (eavValue.Value === true) {
          return true;
        }
      }
    }

    return false;
  }

  private getContentTypeTitle(contentType: EavContentType, currentLanguage: string, defaultLanguage: string): string {
    let label: string;
    try {
      const type = contentType.Metadata
        // xx ContentType is a historic bug and should be fixed when JSONs are rechecked
        .find(metadata => metadata.Type.Name === 'ContentType' || metadata.Type.Name === 'xx ContentType');
      if (!!type) {
        label = LocalizationHelper.getValueOrDefault(type.Attributes.Label, currentLanguage, defaultLanguage)?.Value;
      }
      label = label || contentType.Name;
    } catch (error) {
      label = contentType.Name;
    }
    return label;
  }

  private findIsLastInGroup(contentType: EavContentType, attribute: EavContentTypeAttribute): boolean {
    const index = contentType.Attributes.indexOf(attribute);
    if (contentType.Attributes[index + 1] == null) { return true; }

    const indexOfFirstEmpty = contentType.Attributes.findIndex(a => a.InputType === InputTypeConstants.EmptyDefault);
    if (index < indexOfFirstEmpty) { return false; }

    const isNotEmpty = attribute.InputType !== InputTypeConstants.EmptyDefault;
    const nextIsEmpty = contentType.Attributes[index + 1].InputType === InputTypeConstants.EmptyDefault;
    if (isNotEmpty && nextIsEmpty) { return true; }

    return false;
  }
}

function settingsEqual(x: FieldSettings, y: FieldSettings) {
  const obj1 = x as { [key: string]: any };
  const obj2 = y as { [key: string]: any };

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) { return false; }

  const equal = keys1.every(key1 => {
    if (obj2[key1] == null) { return false; }

    return obj1[key1] === obj2[key1];
  });

  return equal;
}

function validatorsEqual(x: ValidatorFn[], y: ValidatorFn[]) {
  if (x.length !== y.length) { return false; }

  const equal = x.every((validator, index) => {
    if (y[index] == null) { return false; }

    return x[index] === y[index];
  });

  return equal;
}

function translationStateEqual(x: TranslationState, y: TranslationState) {
  const obj1 = x as { [key: string]: any };
  const obj2 = y as { [key: string]: any };

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) { return false; }

  const equal = keys1.every(key1 => {
    if (obj2[key1] == null) { return false; }

    return obj1[key1] === obj2[key1];
  });

  return equal;
}

function getDisabledBecauseTranslations(
  attributeValues: EavValues<any>,
  disableTranslation: boolean,
  currentLanguage: string,
  defaultLanguage: string,
): boolean {
  if (currentLanguage === defaultLanguage) { return false; }
  if (!LocalizationHelper.translationExistsInDefault(attributeValues, defaultLanguage)) { return true; }
  if (disableTranslation) { return true; }
  if (LocalizationHelper.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage)) { return false; }
  if (LocalizationHelper.isReadonlyTranslationExist(attributeValues, currentLanguage)) { return true; }
  return true;
}

function getTranslationState2New(
  attributeValues: EavValues<any>,
  disableTranslation: boolean,
  currentLanguage: string,
  defaultLanguage: string,
): TranslationState {
  let infoLabel: string;
  let infoMessage: string;

  if (disableTranslation) {
    infoLabel = 'LangMenu.InAllLanguages';
    infoMessage = '';
  } else if (!LocalizationHelper.translationExistsInDefault(attributeValues, defaultLanguage)) {
    infoLabel = 'LangMenu.MissingDefaultLangValue';
    infoMessage = defaultLanguage;
  } else {
    const editableTranslationExists = LocalizationHelper.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage);
    const readonlyTranslationExists = LocalizationHelper.isReadonlyTranslationExist(attributeValues, currentLanguage);

    if (editableTranslationExists || readonlyTranslationExists) {
      const dimensions = LocalizationHelper.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
        .Dimensions.map(dimension => dimension.Value)
        .filter(dimension => !dimension.includes(currentLanguage));

      const isShared = dimensions.length > 0;
      if (isShared) {
        if (editableTranslationExists) {
          infoLabel = 'LangMenu.In';
        } else if (readonlyTranslationExists) {
          infoLabel = 'LangMenu.From';
        }
        infoMessage = TranslateMenuHelpers.calculateSharedInfoMessage(dimensions, currentLanguage);
      } else {
        infoLabel = '';
        infoMessage = '';
      }
    } else {
      infoLabel = 'LangMenu.UseDefault';
      infoMessage = '';
    }
  }
  const state = getTranslationState(attributeValues, disableTranslation, currentLanguage, defaultLanguage);
  const translationState: TranslationState = {
    infoLabel,
    infoMessage,
    language: state.language,
    linkType: state.linkType,
  };
  return translationState;
}

function getTranslationState(
  attributeValues: EavValues<any>,
  disableTranslation: boolean,
  currentLanguage: string,
  defaultLanguage: string,
): TranslationStateCore {
  let language: string;
  let linkType: string;

  // Determine is control disabled or enabled and info message
  if (!LocalizationHelper.translationExistsInDefault(attributeValues, defaultLanguage)) {
    language = '';
    linkType = TranslationLinkConstants.MissingDefaultLangValue;
  } else if (disableTranslation) {
    language = '';
    linkType = TranslationLinkConstants.DontTranslate;
  } else if (LocalizationHelper.isEditableTranslationExist(attributeValues, currentLanguage, defaultLanguage)) {
    const editableElements = LocalizationHelper.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
      .Dimensions.filter(dimension => dimension.Value !== currentLanguage);

    if (editableElements.length > 0) {
      language = editableElements[0].Value;
      linkType = TranslationLinkConstants.LinkReadWrite;
    } else {
      language = '';
      linkType = TranslationLinkConstants.Translate;
    }
  } else if (LocalizationHelper.isReadonlyTranslationExist(attributeValues, currentLanguage)) {
    const readOnlyElements = LocalizationHelper.getValueTranslation(attributeValues, currentLanguage, defaultLanguage)
      .Dimensions.filter(dimension => dimension.Value !== currentLanguage);

    language = readOnlyElements[0].Value;
    linkType = TranslationLinkConstants.LinkReadOnly;
  } else {
    language = '';
    linkType = TranslationLinkConstants.DontTranslate;
  }

  const translationState: TranslationStateCore = {
    language,
    linkType,
  };
  return translationState;
}
