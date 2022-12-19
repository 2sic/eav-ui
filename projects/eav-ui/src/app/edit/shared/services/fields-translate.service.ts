import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { EavService, FieldsSettingsService } from '.';
import { consoleLogAngular } from '../../../shared/helpers/console-log-angular.helper';
import { InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { EavItem } from '../models/eav';
import { ContentTypeService, ItemService, LanguageInstanceService } from '../store/ngrx-data';

@Injectable()
export class FieldsTranslateService {
  private entityGuid: string;
  private contentTypeId: string;

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
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
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true, transactionItem);

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const defaultValue = LocalizationHelpers.getValueTranslation(values, defaultLanguage, defaultLanguage);
    return this.addItemAttributeValueHelper(fieldName, defaultValue.Value, currentLanguage, false);
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  translateFrom(fieldName: string, translateFromLanguageKey: string, showAlert: boolean): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const apiKeyInfo = this.eavService.eavConfig.dialogContext.ApiKeys.find(x => x.NameId === "google-translate");
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const textForTranslation = attributes[fieldName].Values.find(v => v.Dimensions.find(x => x.Value === translateFromLanguageKey)).Value;
    const translationData = {
      q: textForTranslation,
      target: currentLanguage,
      source: translateFromLanguageKey
    }
    if (apiKeyInfo.IsDemo && showAlert)
      alert(`This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`);
    this.http.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKeyInfo.ApiKey }`, translationData)
      .pipe(tap(
        (response: any) => {
          this.addItemAttributeValueHelper(fieldName, response.data.translations[0].translatedText, currentLanguage, false);
        }
      )).subscribe();
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
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
      consoleLogAngular(`${currentLanguage}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
    }
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, true, transactionItem,
    );
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, currentLanguage, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, linkWithLanguageKey, defaultLanguage, false, transactionItem,
    );
  }

  translateMany(): void {
    const translateable = this.findTranslatableFields();

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.translate(fieldName, isTransaction, transactionItem);
    }
  }

  dontTranslateMany(): void {
    const translateable = this.findTranslatableFields();

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.dontTranslate(fieldName, isTransaction, transactionItem);
    }
  }

  translateFromManyWithContent(translateFromLanguageKey: string): void {
    if (this.eavService.eavConfig.dialogContext.ApiKeys.find(x => x.NameId === "google-translate").IsDemo)
      alert(`This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`);
    const translateable = this.findTranslatableAndAutotranslatableFieldsWithContent(translateFromLanguageKey);
    for (const fieldName of translateable) {
      this.translateFrom(fieldName, translateFromLanguageKey, false);
    }
  }

  findTranslatableAndAutotranslatableFieldsWithContent(translateFromLanguageKey: string): string[] {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const translatebleFieldNames = this.findTranslatableAndAutotranslatableFields();
    const fieldNames: string[] = [];
    translatebleFieldNames.forEach(fieldName => { 
      let value = attributes[fieldName].Values.find(v => v.Dimensions.find(x => x.Value === translateFromLanguageKey))?.Value;
      if (value != "" && value != null && value != undefined)
        fieldNames.push(fieldName);
    });
    return fieldNames;
  }

  findTranslatableFields(): string[] { 
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    return Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));
  }

  findTranslatableAndAutotranslatableFields(): string[] {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    return Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName) && !this.isAutoTranslationDisabled(fieldName));
  }

  private isTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableTranslation;
  }

  private isAutoTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableAutoTranslation;
  }

  private addItemAttributeValueHelper(fieldName: string, value: any, currentLanguage: string, isReadOnly: boolean): EavItem {
    const contentType = this.contentTypeService.getContentType(this.contentTypeId);
    const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
    return this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, value, currentLanguage, isReadOnly, ctAttribute.Type,
    );
  }
}
