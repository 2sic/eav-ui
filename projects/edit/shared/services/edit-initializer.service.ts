import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { EavService } from '.';
import { FieldSettings } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { calculateIsParentDialog, sortLanguages } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.helpers';
import { EavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { EditParams } from '../../edit-matcher.models';
import { BestValueModes } from '../constants/localization.constants';
import { FieldsSettingsHelpers, InputFieldHelpers, LocalizationHelpers } from '../helpers';
import { Language, PublishStatus } from '../models';
// tslint:disable-next-line:max-line-length
import { ContentTypeItemService, ContentTypeService, FeatureService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, PrefetchService, PublishStatusService } from '../store/ngrx-data';

@Injectable()
export class EditInitializerService implements OnDestroy {
  loaded$ = new BehaviorSubject(false);

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
    private formPrefetchService: PrefetchService,
  ) { }

  ngOnDestroy(): void {
    this.loaded$.complete();
  }

  fetchFormData(): void {
    const form = convertUrlToForm((this.route.snapshot.params as EditParams).items);
    const editItems = JSON.stringify(form.items);
    this.eavService.fetchFormData(editItems).subscribe(formData => {
      this.saveFormData(formData);
      this.fixDefaultLanguageValues();
      this.fixCurrentLanguageValues();
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
    if (formData.Prefetch != null) {
      const prefetchGuid = itemGuids.join();
      this.formPrefetchService.loadPrefetch(formData.Prefetch, prefetchGuid);
    }

    const items = this.itemService.getItems(itemGuids);
    const createMode = items[0].Entity.Id === 0;
    const isCopy = items[0].Header.DuplicateEntity != null;
    const enableHistory = !createMode && this.route.snapshot.data.history !== false;
    this.eavService.setEavConfig(formData.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory);

    const currentLanguage = this.eavService.eavConfig.lang;
    const defaultLanguage = this.eavService.eavConfig.langPri;
    const languages = this.eavService.eavConfig.langs;
    // Load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const isoLangCode = currentLanguage.split('-')[0];
      this.translate.use(isoLangCode);

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

  /** Check whether all attributes in all items have value in default language. If some value is missing, switch language to default */
  private fixDefaultLanguageValues() {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (currentLanguage === defaultLanguage) { return; }

    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getInputTypes();
    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const ctAttribute of contentType.Attributes) {
        const calculatedInputType = InputFieldHelpers.calculateInputType(ctAttribute, inputTypes);
        if (calculatedInputType.inputType === InputTypeConstants.EmptyDefault) { continue; }

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const value = LocalizationHelpers.getBestValue(attributeValues, defaultLanguage, defaultLanguage, BestValueModes.Strict);
        if (value !== undefined) { continue; }

        this.languageInstanceService.setCurrentLanguage(this.eavService.eavConfig.formId, defaultLanguage);
        const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: defaultLanguage });
        this.snackBar.open(message, null, { duration: 5000 });
      }
    }
  }

  /** Set default values where they are missing */
  private fixCurrentLanguageValues() {
    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const inputTypes = this.inputTypeService.getInputTypes();
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const languages = this.languageService.getLanguages();

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const ctAttribute of contentType.Attributes) {
        const calculatedInputType = InputFieldHelpers.calculateInputType(ctAttribute, inputTypes);
        const inputType = calculatedInputType.inputType;
        if (inputType === InputTypeConstants.EmptyDefault) { continue; }

        const attributeValues = item.Entity.Attributes[ctAttribute.Name];
        const value = LocalizationHelpers.getBestValue(attributeValues, currentLanguage, defaultLanguage, BestValueModes.Default);

        // entity fields for empty items prefilled on the backend with []
        // so I can never know if entity field is brand new, or just emptied out by the user
        const valueIsEmpty = value === undefined || (Array.isArray(value) && value.length === 0 && this.eavService.eavConfig.createMode);
        if (!valueIsEmpty) { continue; }

        const merged = FieldsSettingsHelpers.mergeSettings<FieldSettings>(ctAttribute.Metadata, currentLanguage, defaultLanguage);
        this.itemService.setDefaultValue(item, ctAttribute, inputType, merged, languages, currentLanguage, defaultLanguage);
      }
    }
  }
}
