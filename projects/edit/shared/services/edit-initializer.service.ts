import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import isEmpty from 'lodash-es/isEmpty';
import { BehaviorSubject } from 'rxjs';
import { EavService } from '..';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { calculateIsParentDialog, sortLanguages } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.helpers';
import { EavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { EditParams } from '../../edit-matcher.models';
import { InputFieldHelpers } from '../helpers/input-field.helpers';
import { LocalizationHelpers } from '../helpers/localization.helpers';
import { Language, PublishStatus } from '../models';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { FeatureService } from '../store/ngrx-data/feature.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { LanguageService } from '../store/ngrx-data/language.service';
import { PrefetchService } from '../store/ngrx-data/prefetch.service';
import { PublishStatusService } from '../store/ngrx-data/publish-status.service';

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

  /** If current language !== default language check whether all attributes in all items have value in default language */
  private fixDefaultLanguageValues() {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    if (currentLanguage === defaultLanguage) { return; }

    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);
    const valuesExistInDefaultLanguage = LocalizationHelpers.valuesExistInDefaultLanguage(
      items, defaultLanguage, this.inputTypeService, this.contentTypeService,
    );
    if (!valuesExistInDefaultLanguage) {
      this.languageInstanceService.setCurrentLanguage(this.eavService.eavConfig.formId, defaultLanguage);
      const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: defaultLanguage });
      this.snackBar.open(message, null, { duration: 5000 });
    }
  }

  private fixCurrentLanguageValues() {
    const items = this.itemService.getItems(this.eavService.eavConfig.itemGuids);

    for (const item of items) {
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);

      for (const attribute of contentType.Attributes) {
        const inputTypes = this.inputTypeService.getInputTypes();
        const calculatedInputType = InputFieldHelpers.calculateInputType(attribute, inputTypes);
        const inputType = calculatedInputType.inputType;
        if (inputType === InputTypeConstants.EmptyDefault) { continue; }

        const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
        const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
        const attributeValues = item.Entity.Attributes[attribute.Name];
        const value = LocalizationHelpers.translate(currentLanguage, defaultLanguage, attributeValues, null);
        // set default value if needed
        const valueIsEmpty = isEmpty(value) && typeof value !== 'boolean' && typeof value !== 'number' && value !== '';
        if (!valueIsEmpty) { continue; }

        const languages = this.languageService.getLanguages();
        const fieldSettings = LocalizationHelpers.translateSettings(attribute.Settings, currentLanguage, defaultLanguage);
        this.itemService.setDefaultValue(item, attribute, inputType, fieldSettings, languages, currentLanguage, defaultLanguage);
      }
    }
  }
}
