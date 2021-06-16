import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { UpdateEnvVarsFromDialogSettings } from '../../../ng-dialogs/src/app/shared/helpers/update-env-vars-from-dialog-settings.helper';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { calculateIsParentDialog, sortLanguages } from '../../dialog/main/edit-dialog-main.helpers';
import { EavFormData } from '../../dialog/main/edit-dialog-main.models';
import { EditParams } from '../../edit-matcher.models';
import { BestValueModes } from '../constants/localization.constants';
import { FieldsSettingsHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { FormValues, Language, PublishStatus } from '../models';
// tslint:disable-next-line:max-line-length
import { AdamCacheService, ContentTypeItemService, ContentTypeService, EntityCacheService, FeatureService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, LinkCacheService, PublishStatusService } from '../store/ngrx-data';

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
    private featureService: FeatureService,
    private publishStatusService: PublishStatusService,
    private translate: TranslateService,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private entityCacheService: EntityCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
  ) { }

  ngOnDestroy(): void {
    this.loaded$.complete();
  }

  fetchFormData(): void {
    const form = convertUrlToForm((this.route.snapshot.params as EditParams).items);
    const editItems = JSON.stringify(form.items);
    this.eavService.fetchFormData(editItems).subscribe(formData => {
      UpdateEnvVarsFromDialogSettings(formData.Context.App);
      this.saveFormData(formData);
      this.keepInitialValues();
      this.setMissingValues();

      this.loaded$.next(true);
    });
  }

  private saveFormData(formData: EavFormData): void {
    const formId = Math.floor(Math.random() * 99999);
    const isParentDialog = calculateIsParentDialog(this.route);
    const itemGuids = formData.Items.map(item => item.Entity.Guid);

    this.itemService.loadItems(formData.Items);
    // we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addInputTypes(formData.InputTypes);
    this.contentTypeItemService.addContentTypeItems(formData.ContentTypeItems);
    this.contentTypeService.addContentTypes(formData.ContentTypes);
    this.featureService.loadFeatures(formData.Features);
    this.adamCacheService.loadPrefetch(formData.Prefetch?.Adam);
    this.entityCacheService.loadEntities(formData.Prefetch?.Entities);
    this.linkCacheService.loadPrefetch(formData.Prefetch?.Links, formData.Prefetch?.Adam);

    const items = this.itemService.getItems(itemGuids);
    const createMode = items[0].Entity.Id === 0;
    const isCopy = items[0].Header.DuplicateEntity != null;
    const enableHistory = !createMode && this.route.snapshot.data.history !== false;
    this.eavService.setEavConfig(formData.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory);

    const currentLanguage = this.eavService.eavConfig.lang;
    const defaultLanguage = this.eavService.eavConfig.langPri;
    const languages = this.eavService.eavConfig.langs;
    // WARNING! TranslateService is a new instance for every form and language must be set for every one of them
    const isoLangCode = currentLanguage.split('-')[0];
    this.translate.use(isoLangCode);

    // load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const eavLangs: Language[] = Object.entries(languages).map(([key, name]) => ({ key, name }));
      const sortedLanguages = sortLanguages(defaultLanguage, eavLangs);
      this.languageService.loadLanguages(sortedLanguages);
    }
    this.languageInstanceService.addLanguageInstance(formId, currentLanguage, defaultLanguage, currentLanguage, false);

    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: formData.DraftShouldBranch,
      IsPublished: formData.IsPublished,
    };
    this.publishStatusService.setPublishStatus(publishStatus);
  }

  private keepInitialValues(): void {
    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const languages = this.languageService.getLanguages().map(language => language.key);
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (!languages.includes(currentLanguage)) {
      languages.push(currentLanguage);
    }
    if (!languages.includes(defaultLanguage)) {
      languages.push(defaultLanguage);
    }

    for (const item of items) {
      for (const language of languages) {
        const formValues: FormValues = {};
        for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes)) {
          formValues[fieldName] = LocalizationHelpers.translate(language, defaultLanguage, fieldValues, null);
        }
        this.initialFormValues[this.getInitialValuesKey(item.Entity.Guid, language)] = formValues;
      }
    }
  }

  private getInitialValuesKey(entityGuid: string, language: string): string {
    return `entityGuid:${entityGuid}:language:${language}`;
  }

  getInitialValues(entityGuid: string, language: string): FormValues {
    return this.initialFormValues[this.getInitialValuesKey(entityGuid, language)];
  }

  private setMissingValues(): void {
    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getInputTypes();
    const languages = this.languageService.getLanguages();
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    let switchToDefault = false;

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const ctAttribute of contentType.Attributes) {
        const inputType = inputTypes.find(i => i.Type === ctAttribute.InputType);
        // 'custom-default' doesn't have inputType and 'empty-default' and 'empty-end' don't save value
        const empties: string[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];
        if (empties.includes(inputType?.Type)) { continue; }

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const fieldSettings = FieldsSettingsHelpers.setDefaultFieldSettings(
          FieldsSettingsHelpers.mergeSettings<FieldSettings>(ctAttribute.Metadata, defaultLanguage, defaultLanguage),
        );

        if (languages.length === 0) {
          const firstValue = LocalizationHelpers.getBestValue(attributeValues, '*', '*', BestValueModes.Default);
          if (InputFieldHelpers.isValueEmpty(firstValue, this.eavService)) {
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
          if (InputFieldHelpers.isValueEmpty(defaultLanguageValue, this.eavService)) {
            this.itemService.setDefaultValue(item, ctAttribute, inputType, fieldSettings, languages, defaultLanguage);
            switchToDefault = true;
          }
        }
      }
    }

    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    if (switchToDefault && currentLanguage !== defaultLanguage) {
      this.languageInstanceService.setCurrentLanguage(this.eavService.eavConfig.formId, defaultLanguage);
      const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: defaultLanguage });
      this.snackBar.open(message, null, { duration: 5000 });
    }
  }
}
