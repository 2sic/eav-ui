import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { FormConfigService, FieldsSettingsService } from '.';
import { EditApiKeyPaths } from '../../../shared/constants/eav.constants';
import { consoleLogEditForm } from '../../../shared/helpers/console-log-angular.helper';
import { ApiKeySpecs } from '../../../shared/models/dialog-context.models';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { EavItem } from '../models/eav';
import { ContentTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';

const apiKeyInDemoModeAlert = `This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`;

@Injectable()
export class FieldsTranslateService {
  private entityGuid: string;
  private contentTypeId: string;

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private languageStore: LanguageInstanceService,
    private formConfig: FormConfigService,
    private contentTypeService: ContentTypeService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  init(entityGuid: string): void {
    this.entityGuid = entityGuid;
    const item = this.itemService.getItem(entityGuid);
    this.contentTypeId = InputFieldHelpers.getContentTypeId(item);
  }

  translate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }
    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);

    transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true, transactionItem);

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const doesFieldHaveExistingDimension = values.Values.find(v => v.Dimensions.find(x => x.Value === currentLanguage)) !== undefined;
    const defaultValue = LocalizationHelpers.getValueTranslation(values, defaultLanguage, defaultLanguage);
    if (!doesFieldHaveExistingDimension) 
      return this.addItemAttributeValueHelper(fieldName, defaultValue.Value, currentLanguage, false);
    else
      return null;
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  /**
   * Auto-translate the field value to the current language.
   * @param areAllChecksKnown If true, the function will not check if the field value is empty, or if the field auto-translate was disabled by default.
   */
  autoTranslate(fieldNames: string[], autoTranslateLanguageKey: string, isMany: boolean = false, areAllChecksKnown: boolean = false): void {
    // Get API key and optionally show warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      alert(apiKeyInDemoModeAlert);

    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);
    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const attributes = this.itemService.getItemAttributes(this.entityGuid);

    fieldNames = fieldNames.filter(field => !this.isTranslationDisabled(field));
    const textsForTranslation = fieldNames.map(field => attributes[field].Values.find(v => v.Dimensions.find(x => x.Value === autoTranslateLanguageKey)).Value);
    const doFieldsHaveExistingDimension = fieldNames.map(field => attributes[field].Values.find(v => v.Dimensions.find(x => x.Value === currentLanguage)) !== undefined);

    if (!areAllChecksKnown) {
      fieldNames.forEach((field, i) => {
        const isAutoTranslationEnabledButWasDisabledByDefault = this.isAutoTranslationEnabledButWasDisabledByDefault(field);
        if (textsForTranslation[i] == null || textsForTranslation[i] === '' || isAutoTranslationEnabledButWasDisabledByDefault) {
          this.translate(field);
        }
      });
    }

    const translationData = {
      q: textsForTranslation,
      target: currentLanguage,
      source: autoTranslateLanguageKey
    };
    this.http.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKeyInfo.ApiKey}`, translationData)
      .pipe(tap(
        (response: any) => {
          response.data.translations.forEach((translation: any, i: number) => {
            const elem = document.createElement('textarea');
            elem.innerHTML = translation.translatedText;
            if (!isMany && doFieldsHaveExistingDimension[i]) {
              this.itemService.updateItemAttributeValue(
                this.entityGuid, fieldNames[i], elem.value, currentLanguage, defaultLanguage, false
              );
            } else if (!doFieldsHaveExistingDimension[i]) {
              this.addItemAttributeValueHelper(fieldNames[i], elem.value, currentLanguage, false);
            }
          });
        }
      )).subscribe();
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);
    const attributeValueTranslation = LocalizationHelpers.getValueTranslation(values, copyFromLanguageKey, defaultLanguage);
    if (attributeValueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelpers.isEditableOrReadonlyTranslationExist(values, currentLanguage, defaultLanguage)
        : false;

      if (valueAlreadyExists) {
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, currentLanguage, defaultLanguage, false,
        );
      } else {
        // Copy attribute value where language is languageKey to new attribute with current language
        this.addItemAttributeValueHelper(fieldName, attributeValueTranslation.Value, currentLanguage, false);
      }
    } else {
      consoleLogEditForm(`${currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, true, transactionItem,
    );
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageStore.getCurrent(this.formConfig.config.formId);
    const defaultLanguage = this.languageStore.getPrimary(this.formConfig.config.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, false, transactionItem,
    );
  }

  translateMany(): void {
    const translatable = this.findTranslatableFields();

    let transactionItem: EavItem;
    for (const fieldName of translatable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translatable[translatable.length - 1];
      transactionItem = this.translate(fieldName, isTransaction, transactionItem);
    }
  }

  dontTranslateMany(): void {
    const translatable = this.findTranslatableFields();

    let transactionItem: EavItem;
    for (const fieldName of translatable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translatable[translatable.length - 1];
      transactionItem = this.dontTranslate(fieldName, isTransaction, transactionItem);
    }
  }

  /**
   * Auto-translates all field that have auto-translate enabled and are not empty, empty ones are unlocked.
   */
  autoTranslateMany(autoTranslateLanguageKey: string): void {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    // fields that have auto-translate enabled and are not empty
    const canTranslate: string[] = [];
    // fields that have auto-translate enabled but didn't have it by default or are empty
    const cantTranslateAndEmpty: string[] = this.findAutoTranslatableFieldsThatWereNotAutoTranslatableByDefault();
    // fields that have auto-translate enabled and can be empty
    const canTranslateWithEmpty = this.findAutoTranslatableFields().filter(x => !cantTranslateAndEmpty.includes(x));
    // separate fields that have auto-translate enabled and are empty
    canTranslateWithEmpty.forEach(fieldName => {
      const value = attributes[fieldName].Values.find(v => v.Dimensions.find(x => x.Value === autoTranslateLanguageKey))?.Value;
      if (value !== '' && value != null && value !== undefined)
        canTranslate.push(fieldName);
      // this is commented out because future edits on fields should automatically be passed to the other languages
      // else
      //   cantTranslateAndEmpty.push(fieldName);
    });
    // translate fields that have auto-translate enabled and are not empty
    this.autoTranslate(canTranslate, autoTranslateLanguageKey, true, true);
    let transactionItem: EavItem;
    // unlock fields that have auto-translate enabled but didn't have it by default or are empty
    cantTranslateAndEmpty.forEach(fieldName => {
      this.translate(fieldName, false, transactionItem);
    });
  }

  /**
   * Returns all fields that can be translated.
   */
  findTranslatableFields(): string[] {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    return Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));
  }

  /**
   * Returns all fields that can be translated and autoTranslated.
   */
  findAutoTranslatableFields(): string[] {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    return Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName) && !this.isAutoTranslationDisabled(fieldName));
  }

  /**
   * Returns all fields that can be translated and autoTranslated, but were not autoTranslatable by default.
   */
  findAutoTranslatableFieldsThatWereNotAutoTranslatableByDefault(): string[] {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    return Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName) && this.isAutoTranslationEnabledButWasDisabledByDefault(fieldName));
  }

  /**
   * Returns true if translation is disabled for the field.
   */
  private isTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableTranslation;
  }

  /**
   * Returns true if auto translation is disabled for the field.
   */
  private isAutoTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableAutoTranslation;
  }

  /**
   * Returns true if auto translation is enabled for the field, but was disabled by default.
   */
  private isAutoTranslationEnabledButWasDisabledByDefault(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    const logic = FieldLogicManager.singleton().get(fieldsProps[fieldName].calculatedInputType.inputType);
    return !fieldsProps[fieldName].settings.DisableAutoTranslation && !logic.canAutoTranslate;
  }

  private addItemAttributeValueHelper(fieldName: string, value: any, currentLanguage: string, isReadOnly: boolean): EavItem {
    const contentType = this.contentTypeService.getContentType(this.contentTypeId);
    const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
    return this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, value, currentLanguage, isReadOnly, ctAttribute.Type
    );
  }
}
