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
    const contentType = this.contentTypeService.getContentType(this.contentTypeId);
    const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
    transactionItem = this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, defaultValue.Value, currentLanguage, false, ctAttribute.Type, isTransaction, transactionItem,
    );
    return transactionItem;
  }

  translateFrom(fieldName: string, translateFromLanguageKey: string) {
    const translateToLanuageKey = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const textForTranslation = attributes[fieldName].Values.find(v => v.Dimensions.find(x => x.Value === translateFromLanguageKey)).Value;
    const translationData = {
      q: textForTranslation,
      target: translateToLanuageKey,
      source: translateFromLanguageKey
    }
    this.http.post('https://translation.googleapis.com/language/translate/v2?key=AIzaSyBEZ-zTKEmWvARdwN4W1aJ1MRLEgUCZ98k', translationData)
      .pipe(tap(
        (response: any) => {
          const contentType = this.contentTypeService.getContentType(this.contentTypeId);
          const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
          this.itemService.addItemAttributeValue(
            this.entityGuid, fieldName, response.data.translations[0].translatedText, translateToLanuageKey, false, ctAttribute.Type,
          ); }
      )).subscribe();
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    if (this.isTranslationDisabled(fieldName)) { return; }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    transactionItem = this.itemService.removeItemAttributeDimension(
      this.entityGuid, fieldName, currentLanguage, isTransaction, transactionItem,
    );
    return transactionItem;
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
        const contentType = this.contentTypeService.getContentType(this.contentTypeId);
        const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
        this.itemService.addItemAttributeValue(
          this.entityGuid, fieldName, attributeValueTranslation.Value, currentLanguage, false, ctAttribute.Type,
        );
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
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const translateable = Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.translate(fieldName, isTransaction, transactionItem);
    }
  }

  dontTranslateMany(): void {
    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const translateable = Object.keys(attributes).filter(fieldName => !this.isTranslationDisabled(fieldName));

    let transactionItem: EavItem;
    for (const fieldName of translateable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translateable[translateable.length - 1];
      transactionItem = this.dontTranslate(fieldName, isTransaction, transactionItem);
    }
  }

  private isTranslationDisabled(fieldName: string) {
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    return fieldsProps[fieldName].settings.DisableTranslation;
  }
}
