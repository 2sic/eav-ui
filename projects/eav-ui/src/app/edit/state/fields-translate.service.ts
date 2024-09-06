import { HttpClient } from '@angular/common/http';
import { Injectable, Signal } from '@angular/core';
import { tap } from 'rxjs';
import { EditApiKeyPaths } from '../../shared/constants/eav.constants';
import { ApiKeySpecs } from '../../shared/models/dialog-context.models';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { EavLogger } from '../../shared/logging/eav-logger';
import { LocalizationHelpers } from '../localization/localization.helpers';
import { EavEntityAttributes, EavItem } from '../shared/models/eav';
import { FieldsSettingsService } from './fields-settings.service';
import { FormConfigService } from '../form/form-config.service';
import { ItemHelper } from '../shared/helpers/item.helper';
import { FormLanguage } from '../form/form-languages.model';
import { ItemService } from './item.service';
import { ContentTypeService } from '../shared/content-types/content-type.service';
import { FieldSettings } from '../../../../../edit-types';
import { FieldProps } from './fields-configs.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

const logThis = false;
const nameOfThis = 'FieldsTranslateService';

const apiKeyInDemoModeAlert = `This translation is a demo. Please provide your own Google Translate API key in the EAV configuration.`;

/**
 * Fields-Translation service.
 * TODO: should probably split into two, to move Auto-Translate SoC
 */
@Injectable()
export class FieldsTranslateService {
  private entityGuid: string;
  private contentTypeId: string;

  log = new EavLogger(nameOfThis, logThis);

  #itemAttributes: Signal<EavEntityAttributes>;

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private formConfig: FormConfigService,
    private contentTypeService: ContentTypeService,
    private fieldsSettingsService: FieldsSettingsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) { }

  updater = this.itemService.updater;

  init(entityGuid: string): void {
    const l = this.log.fn('init');
    this.entityGuid = entityGuid;
    const item = this.itemService.get(entityGuid);
    this.contentTypeId = ItemHelper.getContentTypeNameId(item);
    this.#itemAttributes = this.itemService.itemAttributesSignal(entityGuid);
    l.end('', { entityGuid, contentTypeId: this.contentTypeId });
  }

  //#region Lock / Unlock

  unlock(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fn('translate', { fieldName, isTransaction, transactionItem });
    
    if (this.getInfo(fieldName).DisableTranslation)
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.updater.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, isTransaction, transactionItem);

    const attributes = this.#itemAttributes();
    const values = attributes[fieldName];
    const doesFieldHaveExistingDimension = LocalizationHelpers.findOfExactDimension(values.Values, language.current) !== undefined;
    const defaultValue = LocalizationHelpers.getValueTranslation(values, FormLanguage.bothPrimary(language));
    if (!doesFieldHaveExistingDimension) 
      return l.r(this.addItemAttributeValueHelper(fieldName, defaultValue.Value, language.current, false));
    else
      return l.rNull();
  }

  lock(fieldName: string, isTransaction = false, transactionItem?: EavItem): EavItem {
    const l = this.log.fn('dontTranslate', { fieldName, isTransaction, transactionItem });
    if (this.getInfo(fieldName).DisableTranslation)
      return l.rNull('Translation is disabled for this field.');

    const language = this.formConfig.language();
    transactionItem = this.updater.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, isTransaction, transactionItem);
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
  autoTranslate(fieldNames: string[], autoTranslateLanguageKey: string, isMany: boolean = false, areAllChecksKnown: boolean = false): void {
    // Get API key and optionally show warning
    const apiKeyInfo = this.formConfig.settings.Values[EditApiKeyPaths.GoogleTranslate] as ApiKeySpecs;
    if (apiKeyInfo.IsDemo)
      alert(apiKeyInDemoModeAlert);

    const language = this.formConfig.language();
    const attributes = this.#itemAttributes();

    // Filter out fields that have translation disabled
    fieldNames = fieldNames.filter(field => !this.getInfo(field).DisableTranslation);
    const textsForTranslation = fieldNames.map(field => LocalizationHelpers.findOfExactDimension(attributes[field].Values, autoTranslateLanguageKey).Value);
    const doFieldsHaveExistingDimension = fieldNames.map(field => LocalizationHelpers.findOfExactDimension(attributes[field].Values, language.current) !== undefined);

    if (!areAllChecksKnown)
      fieldNames.forEach((field, i) => {
        const currentText = textsForTranslation[i];
        const isAutoTranslationEnabledButWasDisabledByDefault = this.getInfo(field).autoTranslateIsDisabledByTypeButNotByConfig();
        if (currentText == null || currentText === '' || isAutoTranslationEnabledButWasDisabledByDefault)
          this.unlock(field);
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
              this.updater.updateItemAttributeValue(this.entityGuid, fieldNames[i], elem.value, language, false);
            } else if (!doFieldsHaveExistingDimension[i]) {
              this.addItemAttributeValueHelper(fieldNames[i], elem.value, language.current, false);
            }
          });
        }
      )).subscribe();
  }

  copyFrom(fieldName: string, copyFromLanguageKey: string): void {
    if (this.getInfo(fieldName).DisableTranslation) return;

    const attributes = this.#itemAttributes();
    const values = attributes[fieldName];
    const language = this.formConfig.language();
    const valueTranslation = LocalizationHelpers.getValueTranslation(values, FormLanguage.diffCurrent(language, copyFromLanguageKey));
    if (valueTranslation) {
      const valueAlreadyExists = values
        ? LocalizationHelpers.isEditableOrReadonlyTranslationExist(values, language)
        : false;

      if (valueAlreadyExists)
        // Copy attribute value where language is languageKey to value where language is current language
        this.updater.updateItemAttributeValue(
          this.entityGuid, fieldName, valueTranslation.Value, language, false,
        );
      else
        // Copy attribute value where language is languageKey to new attribute with current language
        this.addItemAttributeValueHelper(fieldName, valueTranslation.Value, language.current, false);
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
    if (this.getInfo(fieldName).DisableTranslation) return;

    const language = this.formConfig.language();
    const transactionItem = this.updater.removeItemAttributeDimension(this.entityGuid, fieldName, language.current, true);
    this.updater.addItemAttributeDimension(
      this.entityGuid, fieldName, language.current, linkWithLanguageKey, language.primary, isReadOnly, transactionItem,
    );
  }


  /**
   * Auto-translates all field that have auto-translate enabled and are not empty, empty ones are unlocked.
   */
  autoTranslateMany(autoTranslateLanguageKey: string): void {
    const attributes = this.#itemAttributes();
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
      this.unlock(fieldName, false, transactionItem);
    });
  }

  /**
   * Returns all fields that can be translated.
   */
  findTranslatableFields(): string[] {
    const attributes = this.#itemAttributes();
    return Object.keys(attributes).filter(fieldName => !this.getInfo(fieldName).DisableTranslation);
  }

  /**
   * Returns all fields that can be translated and autoTranslated.
   */
  findAutoTranslatableFields(): string[] {
    const attributes = this.#itemAttributes();
    const result = Object.keys(attributes).filter(fieldName => this.getInfo(fieldName).isAutoTranslatable);
    this.log.fn('findAutoTranslatableFields', { attributes, result });
    return result;
  }

  private getInfo(fieldName: string): FieldTranslationInfo {
    const settings = this.fieldsSettingsService.getFieldSettings(fieldName);
    return new FieldTranslationInfo(fieldName, settings, () => this.fieldsSettingsService.getFieldsProps());
  }

  /**
   * Returns all fields that can be translated and autoTranslated, but were not autoTranslatable by default.
   */
  findAutoTranslatableFieldsThatWereNotAutoTranslatableByDefault(): string[] {
    const attributes = this.#itemAttributes();
    return Object.keys(attributes).filter(fieldName => this.getInfo(fieldName).notForAutoTranslateBecauseOfType);
  }

  private addItemAttributeValueHelper(fieldName: string, value: any, currentLanguage: string, isReadOnly: boolean): EavItem {
    const l = this.log.fn('addItemAttributeValueHelper', { fieldName, value, currentLanguage, isReadOnly });
    const ctAttribute = this.contentTypeService.getAttribute(this.contentTypeId, fieldName);
    const result = this.updater.addItemAttributeValue(
      this.entityGuid, fieldName, value, currentLanguage, isReadOnly, ctAttribute.Type
    );
    return l.r(result);
  }
}

class FieldTranslationInfo implements Pick<FieldSettings, 'DisableTranslation' | 'DisableAutoTranslation'> {
  constructor(private name: string, private settings: FieldSettings, private getFieldsProps: () => Record<string, FieldProps>) { }

  get isAutoTranslatable(): boolean { return !this.DisableTranslation && !this.DisableAutoTranslation }

  get notForAutoTranslateBecauseOfType(): boolean { return !this.DisableTranslation && this.autoTranslateIsDisabledByTypeButNotByConfig(); }

  get DisableTranslation(): boolean { return this.settings.DisableTranslation; }

  get DisableAutoTranslation(): boolean { return this.settings.DisableAutoTranslation; }

  /**
   * Returns true if auto translation is enabled for the field, but was disabled by default because of the field type.
   * This is meant to spot "additional" disabled fields which should be added to a list of fields that should not be translated.
   * ...this is a bit ugly...
   */
  autoTranslateIsDisabledByTypeButNotByConfig() {
    // first check if it's already disabled - in which case we say "false"
    // so it's not added (again) to lists of Fields that should not be translated
    if (this.DisableAutoTranslation) return false;
    const fieldsProps = this.getFieldsProps();
    const logic = FieldLogicManager.singleton().get(fieldsProps[this.name].constants.inputTypeSpecs.inputType);
    return !logic.canAutoTranslate;
  }

  // ...note: since the code above is so confusing, we should keep the original code for a while 2024-08-27
  // /**
  //  * Returns true if auto translation is enabled for the field, but was disabled by default.
  //  */
  // private autoTranslateIsDisabledByTypeButNotByConfig(fieldName: string) {
  //   const fieldsProps = this.fieldsSettingsService.getFieldsProps();
  //   const logic = FieldLogicManager.singleton().get(fieldsProps[fieldName].constants.inputCalc.inputType);
  //   return !fieldsProps[fieldName].settings.DisableAutoTranslation && !logic.canAutoTranslate;
  // }


}