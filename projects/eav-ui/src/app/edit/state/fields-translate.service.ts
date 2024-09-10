import { HttpClient } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { EditApiKeyPaths } from '../../shared/constants/eav.constants';
import { ApiKeySpecs } from '../../shared/models/dialog-context.models';
import { FieldReader } from '../localization/field-reader';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { FieldsSettingsService } from './fields-settings.service';
import { FormConfigService } from '../form/form-config.service';
import { ItemHelper } from '../shared/helpers/item.helper';
import { FormLanguage } from '../form/form-languages.model';
import { ItemService } from './item.service';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FieldTranslationInfo } from './field-translation-info';
import { classLog } from '../../shared/logging';

const apiKeyInDemoModeAlert = `This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`;

const logSpecs = {
  all: true,
  constructor: false,
  init: true,
  unlock: true,
  lock: true,
  getInfo: true,
  autoTranslate: true,
  findAutoTranslatableFields: true,
  addItemAttributeValueHelper: true,
};

/**
 * Fields-Translation service.
 * TODO: should probably split into two, to move Auto-Translate SoC
 */
@Injectable()
export class FieldsTranslateService {
  log = classLog({FieldsTranslateService}, logSpecs);

  #itemAttributes: Signal<EavEntityAttributes>;

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private formConfig: FormConfigService,
    private contentTypeService: ContentTypeService,
    private fieldsSettingsService: FieldsSettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    this.log.fnIf('constructor');
  }

  updater = this.itemService.updater;

  init(entityGuid: string): void {
    const l = this.log.fnIf('init');
    this.#entityGuid = entityGuid;
    const item = this.itemService.get(entityGuid);
    this.#contentTypeId = ItemHelper.getContentTypeNameId(item);
    this.#itemAttributes = this.itemService.itemAttributesSignal(entityGuid);
    l.end('', { entityGuid, contentTypeId: this.#contentTypeId });
  }

  #entityGuid: string;
  #contentTypeId: string;


  //#region Lock / Unlock

  unlock(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fnIf('unlock', { fieldName, isTransaction, transactionItem });
    
    if (this.#getInfo(fieldName).DisableTranslation)
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.updater.removeItemAttributeDimension(this.#entityGuid, fieldName, language.current, isTransaction, transactionItem);

    const values = this.#itemAttributes()[fieldName];
    const doesFieldHaveExistingDimension = new FieldReader(values, language).currentEditable != null;
    const fieldReaderPrimaryLang = new FieldReader(values, FormLanguage.bothPrimary(language));
    const defaultValue = fieldReaderPrimaryLang.current;
    if (!doesFieldHaveExistingDimension) 
      return l.r(this.#addItemAttributeValueHelper(fieldName, defaultValue.Value, language.current, false));
    else
      return l.rNull();
  }

  lock(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fnIf('lock', { fieldName, isTransaction, transactionItem });
    if (this.#getInfo(fieldName).DisableTranslation)
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.updater.removeItemAttributeDimension(this.#entityGuid, fieldName, language.current, isTransaction, transactionItem);
    return transactionItem;
  }

  /** For all fields, to unlock or lock */
  toggleUnlockOnAll(isUnlock: boolean): void {
    const translatable = this.findTranslatableFields();
    if (translatable.length === 0)
      return this.showMessageNoTranslatableFields(false);

    let transactionItem: EavItem;
    for (const fieldName of translatable) {
      // will finish the transaction when last field is being translated
      const isTransaction = fieldName !== translatable[translatable.length - 1];
      transactionItem = isUnlock
        ? this.unlock(fieldName, isTransaction, transactionItem)
        : this.lock(fieldName, isTransaction, transactionItem);
    }
  }

  //#endregion

  showMessageNoTranslatableFields(forAutoTranslate: boolean): void {
    const msg = this.translate.instant("LangMenu.NoAutoTranslatableFieldsFound".replace("Auto", forAutoTranslate ? "Auto" : ""));
    this.snackBar.open(msg, null, { duration: 2000 });
  }

  /**
   * Auto-translate the field value to the current language.
   * @param areAllChecksKnown If true, the function will not check if the field value is empty, or if the field auto-translate was disabled by default.
   */
  autoTranslate(fieldNames: string[], sourceLanguageKey: string, isMany: boolean = false, areAllChecksKnown: boolean = false): void {
    const l = this.log.fnIf('autoTranslate', { fieldNames, autoTranslateLanguageKey: sourceLanguageKey, isMany, areAllChecksKnown });
    // Get API key and optionally show warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      alert(apiKeyInDemoModeAlert);

    const language = this.formConfig.language();
    const attributes = this.#itemAttributes();

    // Filter out fields that have translation disabled
    fieldNames = fieldNames.filter(f => !this.#getInfo(f).DisableTranslation);
    const textsForTranslation = fieldNames.map(f => new FieldReader(attributes[f], sourceLanguageKey).currentEditable.Value);

    if (!areAllChecksKnown)
      fieldNames.forEach((field, i) => {
        const currentText = textsForTranslation[i];
        const isAutoTranslationEnabledButWasDisabledByDefault = this.#getInfo(field).autoTranslateIsDisabledByTypeButNotByConfig();
        if (currentText == null || currentText === '' || isAutoTranslationEnabledButWasDisabledByDefault)
          this.unlock(field);
      });

    const translationData = {
      q: textsForTranslation,
      target: language.current,
      source: sourceLanguageKey
    };
    this.http.post(`https://translation.googleapis.com/language/translate/v2?key=${apiKeyInfo.ApiKey}`, translationData)
      .subscribe((response: any) => {
        const fieldsWithExistingDims = fieldNames.map(f => new FieldReader(attributes[f], language).currentEditable != null);
        response.data.translations.forEach((translation: any, i: number) => {
          const elem = document.createElement('textarea');
          elem.innerHTML = translation.translatedText;
          const fieldHasExistingDimension = fieldsWithExistingDims[i];
          if (!isMany && fieldHasExistingDimension) {
            this.updater.updateItemAttributeValue(this.#entityGuid, fieldNames[i], elem.value, language, false);
          } else if (!fieldHasExistingDimension) {
            this.#addItemAttributeValueHelper(fieldNames[i], elem.value, language.current, false);
          }
        });
      });
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.#getInfo(fieldName).DisableTranslation) return;

    const attributes = this.#itemAttributes();
    const values = attributes[fieldName];
    const language = this.formConfig.language();
    const fieldReader = new FieldReader(values, language);
    const valueTranslation = fieldReader.ofLanguage(FormLanguage.diffCurrent(language, copyFromLanguageKey));
    if (valueTranslation) {
      const valueAlreadyExists = values
        ? fieldReader.isEditableOrReadonlyTranslationExist()
        : false;

      if (valueAlreadyExists)
        // Copy attribute value where language is languageKey to value where language is current language
        this.updater.updateItemAttributeValue(
          this.#entityGuid, fieldName, valueTranslation.Value, language, false,
        );
      else
        // Copy attribute value where language is languageKey to new attribute with current language
        this.#addItemAttributeValueHelper(fieldName, valueTranslation.Value, language.current, false);
    } else
      this.log.a(`${language.current}: Cant copy value from ${copyFromLanguageKey} because that value does not exist.`);
  }

  linkReadOnly(fieldName: string, linkWithLanguageKey: string): void {
    this.linkToOtherField(fieldName, linkWithLanguageKey, true);
  }

  linkReadWrite(fieldName: string, linkWithLanguageKey: string): void {
    return this.linkToOtherField(fieldName, linkWithLanguageKey, false);
  }

  private linkToOtherField(fieldName: string, linkWithLanguageKey: string, isReadOnly: boolean): void {
    if (this.#getInfo(fieldName).DisableTranslation) return;

    const language = this.formConfig.language();
    const transactionItem = this.updater.removeItemAttributeDimension(this.#entityGuid, fieldName, language.current, true);
    this.updater.addItemAttributeDimension(
      this.#entityGuid, fieldName, language.current, linkWithLanguageKey, language.primary, isReadOnly, transactionItem,
    );
  }


  /**
   * Auto-translates all field that have auto-translate enabled and are not empty, empty ones are unlocked.
   */
  autoTranslateMany(sourceLanguageKey: string): void {
    const attributes = this.#itemAttributes();
    // fields that have auto-translate enabled and are not empty
    const canTranslate: string[] = [];
    // fields that have auto-translate enabled but didn't have it by default or are empty
    const cantTranslateAndEmpty: string[] = this.findAutoTranslatableFieldsThatWereNotAutoTranslatableByDefault();
    // fields that have auto-translate enabled and can be empty
    const canTranslateWithEmpty = this.findAutoTranslatableFields().filter(x => !cantTranslateAndEmpty.includes(x));
    // separate fields that have auto-translate enabled and are empty
    canTranslateWithEmpty.forEach(fieldName => {
      const value = new FieldReader(attributes[fieldName], sourceLanguageKey).currentEditable?.Value;
      if (value !== '' && value != null && value !== undefined)
        canTranslate.push(fieldName);
      // this is commented out because future edits on fields should automatically be passed to the other languages
      // else
      //   cantTranslateAndEmpty.push(fieldName);
    });
    // translate fields that have auto-translate enabled and are not empty
    this.autoTranslate(canTranslate, sourceLanguageKey, true, true);
    let transactionItem: EavItem;
    // unlock fields that have auto-translate enabled but didn't have it by default or are empty
    cantTranslateAndEmpty.forEach(fieldName => {
      this.unlock(fieldName, false, transactionItem);
    });
  }

  /**
   * Returns all fields that can be translated.
   */
  findTranslatableFields(): string[] {
    const attributes = this.#itemAttributes();
    return Object.keys(attributes).filter(fieldName => !this.#getInfo(fieldName).DisableTranslation);
  }

  /**
   * Returns all fields that can be translated and autoTranslated.
   */
  findAutoTranslatableFields(): string[] {
    const attributes = this.#itemAttributes();
    const result = Object.keys(attributes).filter(fieldName => this.#getInfo(fieldName).isAutoTranslatable);
    this.log.fnIf('findAutoTranslatableFields', { attributes, result });
    return result;
  }

  #getInfo(fieldName: string): FieldTranslationInfo {
    const ti = new FieldTranslationInfo(() => this.fieldsSettingsService.fieldProps[fieldName]());
    this.log.fnIf('getInfo', { fieldName, ti });
    return ti;
  }

  /**
   * Returns all fields that can be translated and autoTranslated, but were not autoTranslatable by default.
   */
  findAutoTranslatableFieldsThatWereNotAutoTranslatableByDefault(): string[] {
    const attributes = this.#itemAttributes();
    return Object.keys(attributes).filter(fieldName => this.#getInfo(fieldName).notForAutoTranslateBecauseOfType);
  }

  #addItemAttributeValueHelper(fieldName: string, value: any, currentLanguage: string, isReadOnly: boolean): EavItem {
    const l = this.log.fnIf('addItemAttributeValueHelper', { fieldName, value, currentLanguage, isReadOnly });
    const ctAttribute = this.contentTypeService.getAttribute(this.#contentTypeId, fieldName);
    const result = this.updater.addItemAttributeValue(
      this.#entityGuid, fieldName, value, currentLanguage, isReadOnly, ctAttribute.Type
    );
    return l.r(result);
  }
}

