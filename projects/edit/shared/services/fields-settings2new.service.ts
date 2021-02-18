import { Injectable, OnDestroy } from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { ValidationHelper } from '../../eav-material-controls/validators/validation-helper';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { InputFieldHelper } from '../helpers/input-field-helper';
import { LocalizationHelper } from '../helpers/localization-helper';
import { ContentTypeSettings, FieldsProps } from '../models';
import { EavContentType, EavContentTypeAttribute, EavEntity, EavItem } from '../models/eav';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';

@Injectable()
export class FieldsSettings2NewService implements OnDestroy {
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
    const contentType$ = this.contentTypeService.getContentTypeById(contentTypeId);
    const header$ = this.itemService.selectItemHeader(item.Entity.Guid);
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

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
    const inputTypes$ = this.inputTypeService.getAllInputTypes$();
    this.subscription.add(
      combineLatest([contentType$, currentLanguage$, defaultLanguage$, itemAttributes$, inputTypes$]).pipe(
        map(([contentType, currentLanguage, defaultLanguage, itemAttributes, inputTypes]) => {
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
            merged.DisableTranslation = this.findDisableTranslation(attribute.Metadata, inputType);
            // update settings with respective FieldLogics
            const logic = FieldLogicManager.singleton().get(attribute.InputType);
            const fixed = logic?.update(merged, value) ?? merged;

            const validators = ValidationHelper.getValidators(fixed, attribute);
            const calculatedInputType = InputFieldHelper.calculateInputType2New(attribute, inputTypes);
            const wrappers = InputFieldHelper.setWrappers2New(fixed, calculatedInputType);
            const initialSettings = this.mergeSettings<FieldSettings>(attribute.Metadata, this.eavService.eavConfig.lang, defaultLanguage);
            const initialDisabled = initialSettings.Disabled ?? false;

            fieldsProps[attribute.Name] = {
              settings: fixed,
              validators,
              value,
              wrappers,
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
              }
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
  private findDisableTranslation(metadataItems: EavEntity[], inputType: InputType) {
    if (inputType?.DisableI18n) { return true; }
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
