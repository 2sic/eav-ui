import { Injectable, OnDestroy, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { FormConfigService } from '.';
import { UpdateEnvVarsFromDialogSettings } from '../../../shared/helpers/update-env-vars-from-dialog-settings.helper';
import { convertUrlToForm } from '../../../shared/helpers/url-prep.helper';
import { FeaturesService } from '../../../shared/services/features.service';
import { calculateIsParentDialog, sortLanguages } from '../../dialog/main/edit-dialog-main.helpers';
import { EavEditLoadDto } from '../../dialog/main/edit-dialog-main.models';
import { EditParams } from '../../edit-matcher.models';
import { BestValueModes } from '../constants';
import { EntityReader, FieldsSettingsHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { FormValues } from '../models';
import { EavEntity } from '../models/eav/eav-entity';
// tslint:disable-next-line:max-line-length
import { AdamCacheService, ContentTypeItemService, ContentTypeService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, LinkCacheService, PublishStatusService } from '../store/ngrx-data';
import { ItemAddIdentifier } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';
import { FieldLogicManager } from '../../form/shared/field-logic/field-logic-manager';
import { EavContentType } from '../models/eav/eav-content-type';
import { PickerDataCacheService } from '../../form/fields/picker/cache/picker-data-cache.service';
import { ServiceBase } from '../../../shared/services/service-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FormDataService } from './form-data.service';
import { FormLanguage } from '../models/form-languages.model';

const logThis = false;
const nameOfThis = 'EditInitializerService';

@Injectable()
export class EditInitializerService extends ServiceBase implements OnDestroy {

  loaded = signal(false);

  private initialFormValues: Record<string, FormValues> = {};

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
    private entityCacheService: PickerDataCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private featuresService: FeaturesService,
    private formDataService: FormDataService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  fetchFormData(): void {
    const inbound = convertUrlToForm((this.route.snapshot.params as EditParams).items);
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
    this.log.a('fetchFormData', [form]);

    const editItems = JSON.stringify(form.items);
    this.formDataService.fetchFormData(editItems).subscribe(dataFromBackend => {
      // 2dm 2024-06-01 preserve prefill and client-data from original
      // and stop relying on round-trip to keep it
      const formData: EavEditLoadDto = {
        ...dataFromBackend,
        Items: dataFromBackend.Items.map(item => {
          // try to find original item
          const originalItem = form.items.find(i => i.clientId === item.Header.clientId);
          this.log.a('fetchFormData - remix', [item, originalItem]);

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
      this.log.a('fetchFormData - after remix', [formData]);


      // SDV: document what's happening here
      this.featuresService.load(formData.Context);
      UpdateEnvVarsFromDialogSettings(formData.Context.App);
      this.importLoadedData(formData);
      this.keepInitialValues();
      this.initMissingValues();

      this.loaded.set(true);
    });
  }

  private importLoadedData(loadDto: EavEditLoadDto): void {
    const formId = Math.floor(Math.random() * 99999);
    const isParentDialog = calculateIsParentDialog(this.route);
    const itemGuids = loadDto.Items.map(item => item.Entity.Guid);

    this.itemService.loadItems(loadDto.Items);
    // we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addInputTypes(loadDto.InputTypes);
    this.contentTypeItemService.addContentTypeItems(loadDto.ContentTypeItems);
    this.contentTypeService.addContentTypes(loadDto.ContentTypes);
    this.adamCacheService.loadPrefetch(loadDto.Prefetch?.Adam);
    this.entityCacheService.loadEntities(loadDto.Prefetch?.Entities);
    this.linkCacheService.loadPrefetch(loadDto.Prefetch?.Links, loadDto.Prefetch?.Adam);

    const items = this.itemService.getItems(itemGuids);
    const createMode = items[0].Entity.Id === 0;
    const isCopy = (items[0].Header as ItemAddIdentifier).DuplicateEntity != null;
    const enableHistory = !createMode && this.route.snapshot.data.history !== false;
    const settingsAsEav = {
      ...loadDto.Settings,
      Entities: EavEntity.convertMany(loadDto.Settings.Entities),
      ContentTypes: EavContentType.convertMany(loadDto.Settings.ContentTypes),
    };
    this.formConfig.initFormConfig(loadDto.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory, settingsAsEav);

    var langs = this.formConfig.languages;
    // WARNING! TranslateService is a new instance for every form and language must be set for every one of them
    const isoLangCode = langs.current.split('-')[0];
    this.translate.use(isoLangCode);

    // load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const sortedLanguages = sortLanguages(langs.current, langs.list);
      this.languageService.loadLanguages(sortedLanguages);
    }
    this.languageStore.addToStore(formId, langs.current, langs.primary, false);

    // First convert to publish mode, because then it will run checks if this is allowed
    const publishMode = this.publishStatusService.asPublishMode(loadDto.IsPublished, loadDto.DraftShouldBranch);
    this.publishStatusService.setPublishMode(publishMode, formId, this.formConfig);
  }

  /**
   * Preserve initial values for future use in formulas which may need to know the initial value
   */
  private keepInitialValues(): void {
    const items = this.itemService.getItems(this.formConfig.config.itemGuids);
    const allLangs = this.languageService.getLanguages().map(language => language.NameId);
    const language = this.languageStore.getLanguage(this.formConfig.config.formId);
    if (!allLangs.includes(language.current)) allLangs.push(language.current);
    if (!allLangs.includes(language.primary)) allLangs.push(language.primary);

    for (const item of items)
      for (const lang of allLangs) {
        const formValues: FormValues = {};
        const lookupLang = FormLanguage.diffCurrent(language, lang);
        for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes))
          formValues[fieldName] = LocalizationHelpers.translate(lookupLang, fieldValues, null);
        this.initialFormValues[this.initialValuesCacheKey(item.Entity.Guid, lang)] = formValues;
      }
  }

  private initialValuesCacheKey(entityGuid: string, language: string): string {
    return `entityGuid:${entityGuid}:language:${language}`;
  }

  getInitialValues(entityGuid: string, language: string): FormValues {
    return this.initialFormValues[this.initialValuesCacheKey(entityGuid, language)];
  }

  private initMissingValues(): void {
    const l = this.log.fn('initMissingValues');

    const eavConfig = this.formConfig.config;
    const formId = eavConfig.formId;
    const items = this.itemService.getItems(eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getInputTypes();
    const languages = this.languageService.getLanguages();
    const language = this.languageStore.getLanguage(this.formConfig.config.formId);
    /** force UI to switch to default language, because some values are missing in the default language */
    let switchToDefault = false;
    const isCreateMode = eavConfig.createMode;

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const ctAttribute of contentType.Attributes) {
        const currentName = ctAttribute.Name;
        const inputType = inputTypes.find(i => i.Type === ctAttribute.InputType);
        const isEmptyType = EmptyFieldHelpers.isEmptyInputType(inputType?.Type);
        l.a(`Attribute: '${currentName}' InputType: '${inputType?.Type}' isEmptyType: '${isEmptyType}'`);

        if (isEmptyType)
          continue;

        const logic = FieldLogicManager.singleton().getOrUnknown(inputType?.Type);

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const fieldSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
          new EntityReader(language.primary, language.primary).flattenAll(ctAttribute.Metadata)
        );

        if (languages.length === 0) {
          l.a(`${currentName} languages none, simple init`);
          const firstValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Default);
          if (logic.isValueEmpty(firstValue, isCreateMode)) {
          // if (InputFieldHelpers.isValueEmpty(firstValue, this.eavService)) {
            this.itemService.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);
          }
        } else {
          l.a(`${currentName} languages many, complex init`);

          // check if there is a value for the generic / all language
          const disableI18n = inputType?.DisableI18n;
          const noLanguageValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Strict);
          l.values({ disableI18n, noLanguageValue }, currentName);
          if (!disableI18n && noLanguageValue !== undefined) {
            // move * value to defaultLanguage
            const transactionItem = this.itemService.removeItemAttributeDimension(item.Entity.Guid, ctAttribute.Name, '*', true);
            this.itemService.addItemAttributeValue(
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
            const valUsed = this.itemService.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, language.primary);

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
