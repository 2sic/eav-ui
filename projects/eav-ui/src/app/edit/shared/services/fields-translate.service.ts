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
import { ContentTypeService, ItemService } from '../store/ngrx-data';
import { FormLanguage } from '../models/form-languages.model';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'FieldsTranslateService';

const apiKeyInDemoModeAlert = `This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`;

@Injectable()
export class FieldsTranslateService {
  private entityGuid: string;
  private contentTypeId: string;

  log = new EavLogger(nameOfThis, logThis);

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private formConfig: FormConfigService,
    private contentTypeService: ContentTypeService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  init(entityGuid: string): void {
    const l = this.log.fn('init');
    this.entityGuid = entityGuid;
    const item = this.itemService.getItem(entityGuid);
    this.contentTypeId = InputFieldHelpers.getContentTypeId(item);
    l.end({ entityGuid, contentTypeId: this.contentTypeId });
  }

  translate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fn('translate', '', { fieldName, isTransaction, transactionItem });
    
    if (this.isTranslationDisabled(fieldName))
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, isTransaction, transactionItem);

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const doesFieldHaveExistingDimension = LocalizationHelpers.findOfExactDimension(values.Values, language.current) !== undefined;
    const defaultValue = LocalizationHelpers.getValueTranslation(values, FormLanguage.bothPrimary(language));
    if (!doesFieldHaveExistingDimension) 
      return l.r(this.addItemAttributeValueHelper(fieldName, defaultValue.Value, language.current, false));
    else
      return l.rNull();
  }

  dontTranslate(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fn('dontTranslate', '', { fieldName, isTransaction, transactionItem });
    if (this.isTranslationDisabled(fieldName))
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, isTransaction, transactionItem);
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

    const language = this.formConfig.language();
    const attributes = this.itemService.getItemAttributes(this.entityGuid);

    // Filter out fields that have translation disabled
    fieldNames = fieldNames.filter(field => !this.isTranslationDisabled(field));
    const textsForTranslation = fieldNames.map(field => LocalizationHelpers.findOfExactDimension(attributes[field].Values, autoTranslateLanguageKey).Value);
    const doFieldsHaveExistingDimension = fieldNames.map(field => LocalizationHelpers.findOfExactDimension(attributes[field].Values, language.current) !== undefined);

    if (!areAllChecksKnown)
      fieldNames.forEach((field, i) => {
        const currentText = textsForTranslation[i];
        const isAutoTranslationEnabledButWasDisabledByDefault = this.isAutoTranslationEnabledButWasDisabledByDefault(field);
        if (currentText == null || currentText === '' || isAutoTranslationEnabledButWasDisabledByDefault)
          this.translate(field);
      });

    const translationData = {
      q: textsForTranslation,
      target: language.current,
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
                this.entityGuid, fieldNames[i], elem.value, language, false
              );
            } else if (!doFieldsHaveExistingDimension[i]) {
              this.addItemAttributeValueHelper(fieldNames[i], elem.value, language.current, false);
            }
          });
        }
      )).subscribe();
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.isTranslationDisabled(fieldName)) return;

    const attributes = this.itemService.getItemAttributes(this.entityGuid);
    const values = attributes[fieldName];
    const language = this.formConfig.language();
    const valueTranslation = LocalizationHelpers.getValueTranslation(values, FormLanguage.diffCurrent(language, copyFromLanguageKey));
    if (valueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelpers.isEditableOrReadonlyTranslationExist(values, language)
        : false;

      if (valueAlreadyExists)
        // Copy attribute value where language is languageKey to value where language is current language
        this.itemService.updateItemAttributeValue(
          this.entityGuid, fieldName, valueTranslation.Value, language, false,
        );
      else
        // Copy attribute value where language is languageKey to new attribute with current language
        this.addItemAttributeValueHelper(fieldName, valueTranslation.Value, language.current, false);
    } else
      consoleLogEditForm(`${language.current}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    this.linkToOtherField(fieldName, linkWithLanguageKey, true);
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    return this.linkToOtherField(fieldName, linkWithLanguageKey, false);
  }

  private linkToOtherField(fieldName: string, linkWithLanguageKey: string, isReadOnly: boolean): void {
    if (this.isTranslationDisabled(fieldName)) return;

    const language = this.formConfig.language();
    const transactionItem = this.itemService.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, true);
    this.itemService.addItemAttributeDimension(
      this.entityGuid, fieldName, language.current, linkWithLanguageKey, language.primary, isReadOnly, transactionItem,
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
      const value = LocalizationHelpers.findOfExactDimension(attributes[fieldName].Values, autoTranslateLanguageKey)?.Value;
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
    const settings = this.fieldsSettingsService.getFieldSettings(fieldName);
    return settings.DisableTranslation;
  }

  /**
   * Returns true if auto translation is disabled for the field.
   */
  private isAutoTranslationDisabled(fieldName: string) {
    const settings = this.fieldsSettingsService.getFieldSettings(fieldName);
    return settings.DisableAutoTranslation;
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
    const l = this.log.fn('addItemAttributeValueHelper', '', { fieldName, value, currentLanguage, isReadOnly });
    const contentType = this.contentTypeService.getContentType(this.contentTypeId);
    const ctAttribute = contentType.Attributes.find(a => a.Name === fieldName);
    const result = this.itemService.addItemAttributeValue(
      this.entityGuid, fieldName, value, currentLanguage, isReadOnly, ctAttribute.Type
    );
    return l.r(result);
  }
}
