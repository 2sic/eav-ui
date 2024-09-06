import { ContentTypeItemService } from '../shared/store/content-type-item.service';
import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UpdateEnvVarsFromDialogSettings } from '../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { convertUrlToForm } from '../../shared/helpers/url-prep.helper';
import { FeaturesService } from '../../features/features.service';
import { calculateIsParentDialog, sortLanguages } from '../dialog/main/edit-dialog-main.helpers';
import { EavEditLoadDto } from '../dialog/main/edit-dialog-main.models';
import { EditUrlParams } from '../routing/edit-url-params.model';
import { EntityReader, FieldsSettingsHelpers } from '../shared/helpers';
import { EavEntity } from '../shared/models/eav/eav-entity';
import { ItemAddIdentifier } from '../../shared/models/edit-form.model';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { EavContentType } from '../shared/models/eav/eav-content-type';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FormDataService } from '../shared/services/form-data.service';
import { InputTypeHelpers } from '../../shared/fields/input-type-helpers';
import { LocalizationHelpers } from '../localization/localization.helpers';
import { BestValueModes } from '../localization/localization.constants';
import { FormConfigService } from './form-config.service';
import { ItemValuesOfLanguage } from './item-values-of-language.model';
import { FormLanguage } from './form-languages.model';
import { transient } from '../../core';
import { AdamCacheService } from '../shared/store/adam-cache.service';
import { ContentTypeService } from '../shared/store/content-type.service';
import { ItemService } from '../shared/store/item.service';
import { InputTypeService } from '../shared/input-types/input-type.service';
import { PublishStatusService } from '../shared/store/publish-status.service';
import { LanguageService } from '../shared/store/language.service';
import { LanguageInstanceService } from '../shared/store/language-instance.service';
import { LinkCacheService } from '../shared/store/link-cache.service';

const logSpecs = {
  enabled: false,
  name: 'EditInitializerService',
  specs: {
    all: false,
    fetchFormData: false,
    importLoadedData: false,
    keepInitialValues: false,
    initMissingValues: false,
  }
};

/**
 * Service to initialize an edit form. Will:
 * - Load form data
 * - store it in various services, rxStore etc.
 * - Load initial values for formulas
 */
@Injectable()
export class EditInitializerService {

  public loaded = signal(false);

  private formDataService = transient(FormDataService);

  private initialFormValues: Record<string, ItemValuesOfLanguage> = {};

  log = new EavLogger(logSpecs);
  constructor(
    private route: ActivatedRoute,
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private publishStatusService: PublishStatusService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private featuresService: FeaturesService,
  ) { }

  fetchFormData(): void {
    const l = this.log.fnIf('fetchFormData');
    const inbound = convertUrlToForm((this.route.snapshot.params as EditUrlParams).items);
    // 2024-06-01 2dm adding index to round trip
    const form = {
      ...inbound,
      items: inbound.items.map((item, index) => {
        return {
          ...item,
          clientId: index,
        };
      }),
    }
    l.a('fetchFormData', form);

    const editItems = JSON.stringify(form.items);
    this.formDataService.fetchFormData(editItems).subscribe(dataFromBackend => {
      // 2dm 2024-06-01 preserve prefill and client-data from original
      // and stop relying on round-trip to keep it
      const formData: EavEditLoadDto = {
        ...dataFromBackend,
        Items: dataFromBackend.Items.map(item => {
          // try to find original item
          const originalItem = form.items.find(i => i.clientId === item.Header.clientId);
          l.a('fetchFormData - remix', {item, originalItem});

          return originalItem == null
            ? item
            : {
                ...item,
                Header: {
                  ...item.Header,
                  Prefill: originalItem.Prefill,
                  ClientData: originalItem.ClientData,
                }
              };
        }),
      };
      l.a('fetchFormData - after remix', {formData});


      // SDV: document what's happening here
      this.featuresService.load(formData.Context);
      UpdateEnvVarsFromDialogSettings(formData.Context.App);
      this.#importLoadedData(formData);
      this.#keepInitialValues();
      this.initMissingValues();

      this.loaded.set(true);
    });
  }

  #importLoadedData(loadDto: EavEditLoadDto): void {
    const l = this.log.fnIf('importLoadedData');
    const formId = Math.floor(Math.random() * 99999);
    const isParentDialog = calculateIsParentDialog(this.route);
    const itemGuids = loadDto.Items.map(item => item.Entity.Guid);

    this.itemService.loadItems(loadDto.Items);
    // we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addMany(loadDto.InputTypes);
    this.contentTypeItemService.addContentTypeItems(loadDto.ContentTypeItems);
    this.contentTypeService.addContentTypes(loadDto.ContentTypes);
    this.adamCacheService.loadPrefetch(loadDto.Prefetch?.Adam);
    this.linkCacheService.addPrefetch(loadDto.Prefetch?.Links, loadDto.Prefetch?.Adam);

    const items = this.itemService.getMany(itemGuids);
    const createMode = items[0].Entity.Id === 0;
    const isCopy = (items[0].Header as ItemAddIdentifier).DuplicateEntity != null;
    const enableHistory = !createMode && this.route.snapshot.data.history !== false;
    const settingsAsEav = {
      ...loadDto.Settings,
      Entities: EavEntity.convertMany(loadDto.Settings.Entities),
      ContentTypes: EavContentType.convertMany(loadDto.Settings.ContentTypes),
    };
    this.formConfig.initFormConfig(loadDto.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory, settingsAsEav);

    var langs = loadDto.Context.Language;
    // WARNING! TranslateService is a new instance for every form and language must be set for every one of them
    const isoLangCode = langs.Current.split('-')[0];
    this.translate.use(isoLangCode);

    // load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const sortedLanguages = sortLanguages(langs.Primary, langs.List);
      this.languageService.addMany(sortedLanguages);
    }
    this.languageStore.addForm(formId, langs.Primary, langs.Current, false);

    // First convert to publish mode, because then it will run checks if this is allowed
    const publishMode = this.publishStatusService.toPublishMode(loadDto);
    this.publishStatusService.setPublishMode(publishMode, formId, this.formConfig);
  }

  //#region Initial Values for Formulas to retrieve if needed

  /**
   * Preserve initial values for future use in formulas which may need to know the initial value
   */
  #keepInitialValues(): void {
    const l = this.log.fnIf('keepInitialValues');
    const items = this.itemService.getMany(this.formConfig.config.itemGuids);
    const allLangs = this.languageService.getAll().map(language => language.NameId);
    const language = this.formConfig.language();
    if (!allLangs.includes(language.current)) allLangs.push(language.current);
    if (!allLangs.includes(language.primary)) allLangs.push(language.primary);

    for (const item of items)
      for (const lang of allLangs) {
        const formValues: ItemValuesOfLanguage = {};
        const lookupLang = FormLanguage.diffCurrent(language, lang);
        for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes))
          formValues[fieldName] = LocalizationHelpers.translate(lookupLang, fieldValues, null);
        this.initialFormValues[this.initialValuesCacheKey(item.Entity.Guid, lang)] = formValues;
      }
  }

  private initialValuesCacheKey(entityGuid: string, language: string): string {
    return `entityGuid:${entityGuid}:language:${language}`;
  }

  getInitialValues(entityGuid: string, language: string): ItemValuesOfLanguage {
    return this.initialFormValues[this.initialValuesCacheKey(entityGuid, language)];
  }
  //#endregion

  private initMissingValues(): void {
    const l = this.log.fnIf('initMissingValues');

    const updater = this.itemService.updater;
    const eavConfig = this.formConfig.config;
    const formId = eavConfig.formId;
    const items = this.itemService.getMany(eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getAll();
    const languages = this.languageService.getAll();
    const language = this.formConfig.language();
    /** force UI to switch to default language, because some values are missing in the default language */
    let switchToDefault = false;
    const isCreateMode = eavConfig.createMode;

    for (const item of items) {
      const contentType = this.contentTypeService.getContentTypeOfItem(item);

      for (const ctAttribute of contentType.Attributes) {
        const currentName = ctAttribute.Name;
        const inputType = inputTypes.find(i => i.Type === ctAttribute.InputType);
        const isEmptyType = InputTypeHelpers.isEmpty(inputType?.Type);
        l.a(`Attribute: '${currentName}' InputType: '${inputType?.Type}' isEmptyType: '${isEmptyType}'`);

        if (isEmptyType)
          continue;

        const logic = FieldLogicManager.singleton().getOrUnknown(inputType?.Type);

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const fieldSettings = FieldsSettingsHelpers.getDefaultSettings(
          new EntityReader(language.primary, language.primary).flattenAll(ctAttribute.Metadata)
        );

        if (languages.length === 0) {
          l.a(`${currentName} languages none, simple init`);
          const firstValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Default);
          if (logic.isValueEmpty(firstValue, isCreateMode))
            updater.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);
        } else {
          l.a(`${currentName} languages many, complex init`);

          // check if there is a value for the generic / all language
          const disableI18n = inputType?.DisableI18n;
          const noLanguageValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Strict);
          l.values({ disableI18n, noLanguageValue }, currentName);
          if (!disableI18n && noLanguageValue !== undefined) {
            // move * value to defaultLanguage
            const transactionItem = updater.removeItemAttributeDimension(item.Entity.Guid, ctAttribute.Name, '*', true);
            updater.addItemAttributeValue(
              item.Entity.Guid,
              ctAttribute.Name,
              noLanguageValue,
              language.primary,
              false,
              ctAttribute.Type,
              false,
              transactionItem,
            );
            l.a(`${currentName} exit`);
            continue;
          }

          const defaultLanguageValue = LocalizationHelpers.getBestValue(
            attributeValues,
            language.primary,
            language.primary,
            BestValueModes.Strict,
          );


          const valueIsEmpty = logic.isValueEmpty(defaultLanguageValue, isCreateMode);
          l.values({ currentName, valueIsEmpty, defaultLanguageValue, isCreateMode }, currentName);
          if (valueIsEmpty) {
            const valUsed = updater.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);

            // 2022-08-15 2dm added this
            // If we run into more problems (like required date-fields which result in null)
            // we may have to update the logic to use FieldLogicBase and add rules for each type what would be valid
            // or test for IsRequired as well

            // If the primary language isn't ready, enforce switch-to-default
            // Skip this for ephemeral fields as they never load with content
            // Also switch for fields which use null as default (like boolean-tristate) as this kind of "empty" is valid
            if (valUsed != null && !fieldSettings.IsEphemeral)
              switchToDefault = true;
          }
        }
      }
    }

    if (switchToDefault && language.current !== language.primary) {
      this.languageStore.setCurrent(formId, language.primary);
      const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: language.primary });
      this.snackBar.open(message, null, { duration: 5000 });
    }
  }
}
