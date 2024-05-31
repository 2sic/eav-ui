import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { EavService } from '.';
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

@Injectable()
export class EditInitializerService implements OnDestroy {
  loaded$ = new BehaviorSubject(false);

  private initialFormValues: Record<string, FormValues> = {};

  constructor(
    private route: ActivatedRoute,
    private eavService: EavService,
    private itemService: ItemService,
    private inputTypeService: InputTypeService,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private publishStatusService: PublishStatusService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private entityCacheService: PickerDataCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private featuresService: FeaturesService,
  ) { }

  ngOnDestroy(): void {
    this.loaded$.complete();
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
    const editItems = JSON.stringify(form.items);
    this.eavService.fetchFormData(editItems).subscribe(formData => {
      // SDV: comment it
      this.featuresService.load(formData.Context);
      UpdateEnvVarsFromDialogSettings(formData.Context.App);
      this.importLoadedData(formData);
      this.keepInitialValues();
      this.initMissingValues();

      this.loaded$.next(true);
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
    this.eavService.setEavConfig(loadDto.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory, settingsAsEav);

    const currentLanguage = this.eavService.eavConfig.lang;
    const defaultLanguage = this.eavService.eavConfig.langPri;
    const languages = this.eavService.eavConfig.langs;
    // WARNING! TranslateService is a new instance for every form and language must be set for every one of them
    const isoLangCode = currentLanguage.split('-')[0];
    this.translate.use(isoLangCode);

    // load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const sortedLanguages = sortLanguages(defaultLanguage, languages);
      this.languageService.loadLanguages(sortedLanguages);
    }
    this.languageInstanceService.addLanguageInstance(formId, currentLanguage, defaultLanguage, currentLanguage, false);

    // First convert to publish mode, because then it will run checks if this is allowed
    const publishMode = this.publishStatusService.asPublishMode(loadDto.IsPublished, loadDto.DraftShouldBranch);
    this.publishStatusService.setPublishMode(publishMode, formId, this.eavService);
  }

  /**
   * Preserve initial values for future use in formulas which may need to know the initial value
   */
  private keepInitialValues(): void {
    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const languages = this.languageService.getLanguages().map(language => language.NameId);
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (!languages.includes(currentLanguage)) languages.push(currentLanguage);
    if (!languages.includes(defaultLanguage)) languages.push(defaultLanguage);

    for (const item of items)
      for (const language of languages) {
        const formValues: FormValues = {};
        for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes))
          formValues[fieldName] = LocalizationHelpers.translate(language, defaultLanguage, fieldValues, null);
        this.initialFormValues[this.initialValuesCacheKey(item.Entity.Guid, language)] = formValues;
      }
  }

  private initialValuesCacheKey(entityGuid: string, language: string): string {
    return `entityGuid:${entityGuid}:language:${language}`;
  }

  getInitialValues(entityGuid: string, language: string): FormValues {
    return this.initialFormValues[this.initialValuesCacheKey(entityGuid, language)];
  }

  private initMissingValues(): void {
    const eavConfig = this.eavService.eavConfig;
    const formId = eavConfig.formId;
    const items = this.itemService.getItems(eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getInputTypes();
    const languages = this.languageService.getLanguages();
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(formId);
    /** force UI to switch to default language, because some values are missing in the default language */
    let switchToDefault = false;
    const isCreateMode = eavConfig.createMode;

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const ctAttribute of contentType.Attributes) {
        const inputType = inputTypes.find(i => i.Type === ctAttribute.InputType);
        // 'custom-default' doesn't have inputType and 'empty-default' and 'empty-end' and 'empty-message' don't save value
        // const empties: string[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd, InputTypeConstants.EmptyMessage];
        // if (empties.includes(inputType?.Type)) { continue; }
        if (EmptyFieldHelpers.isEmptyInputType(inputType?.Type)) { continue; }

        const logic = FieldLogicManager.singleton().getOrUnknown(inputType?.Type);

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const fieldSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
          new EntityReader(defaultLanguage, defaultLanguage).flattenAll(ctAttribute.Metadata)
          // FieldsSettingsHelpers.mergeSettings<FieldSettings>(ctAttribute.Metadata, defaultLanguage, defaultLanguage),
        );

        if (languages.length === 0) {
          const firstValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Default);
          if (logic.isValueEmpty(firstValue, isCreateMode)) {
          // if (InputFieldHelpers.isValueEmpty(firstValue, this.eavService)) {
            this.itemService.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, defaultLanguage);
          }
        } else {
          const noLanguageValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Strict);
          if (!inputType?.DisableI18n && noLanguageValue !== undefined) {
            // move * value to defaultLanguage
            const transactionItem = this.itemService.removeItemAttributeDimension(item.Entity.Guid, ctAttribute.Name, '*', true);
            this.itemService.addItemAttributeValue(
              item.Entity.Guid,
              ctAttribute.Name,
              noLanguageValue,
              defaultLanguage,
              false,
              ctAttribute.Type,
              false,
              transactionItem,
            );
            continue;
          }

          const defaultLanguageValue = LocalizationHelpers.getBestValue(
            attributeValues,
            defaultLanguage,
            defaultLanguage,
            BestValueModes.Strict,
          );

          // if (InputFieldHelpers.isValueEmpty(defaultLanguageValue, this.eavService)) {
          if (logic.isValueEmpty(defaultLanguageValue, isCreateMode)) {
            const valUsed = this.itemService.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, defaultLanguage);

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

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(formId);
    if (switchToDefault && currentLanguage !== defaultLanguage) {
      this.languageInstanceService.setCurrentLanguage(formId, defaultLanguage);
      const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: defaultLanguage });
      this.snackBar.open(message, null, { duration: 5000 });
    }
  }
}
