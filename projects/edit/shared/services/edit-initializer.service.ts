import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { EavService } from '..';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { calculateIsParentDialog, sortLanguages } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.helpers';
import { EavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { EditParams } from '../../edit-matcher.models';
import { FieldLogicManager } from '../../field-logic/field-logic-manager';
import { Language } from '../models/eav';
import { PublishStatus } from '../models/eav/publish-status';
import { ContentTypeItemService } from '../store/ngrx-data/content-type-item.service';
import { ContentTypeService } from '../store/ngrx-data/content-type.service';
import { FeatureService } from '../store/ngrx-data/feature.service';
import { InputTypeService } from '../store/ngrx-data/input-type.service';
import { ItemService } from '../store/ngrx-data/item.service';
import { LanguageInstanceService } from '../store/ngrx-data/language-instance.service';
import { LanguageService } from '../store/ngrx-data/language.service';
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
  ) { }

  ngOnDestroy(): void {
    this.loaded$.complete();
  }

  fetchFormData(): void {
    const form = convertUrlToForm((this.route.snapshot.params as EditParams).items);
    const editItems = JSON.stringify(form.items);
    this.eavService.fetchFormData(editItems).subscribe(formData => {
      this.saveFormData(formData);
      this.createFieldConfigs();
      this.loaded$.next(true);
    });
  }

  private saveFormData(formData: EavFormData): void {
    const formId = Math.floor(Math.random() * 99999);
    const isParentDialog = calculateIsParentDialog(this.route);
    const itemGuids = formData.Items.map(item => item.Entity.Guid);
    this.itemService.loadItems(formData.Items);

    const items$ = this.itemService.selectItems(itemGuids);
    let createMode: boolean;
    let isCopy: boolean;
    let enableHistory: boolean;
    items$.pipe(take(1)).subscribe(items => {
      createMode = items?.[0].entity.id === 0;
      isCopy = items?.[0].header.DuplicateEntity != null;
      enableHistory = !createMode && this.route.snapshot.data.history !== false;
    });

    // we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addInputTypes(formData.InputTypes);
    this.contentTypeItemService.addContentTypeItems(formData.ContentTypeItems);
    this.contentTypeService.addContentTypes(formData.ContentTypes);
    this.featureService.loadFeatures(formData.Features);
    this.eavService.setEavConfig(formData.Context, formId, isParentDialog, itemGuids, createMode, isCopy, enableHistory);
    const publishStatus: PublishStatus = {
      formId,
      DraftShouldBranch: formData.DraftShouldBranch,
      IsPublished: formData.IsPublished,
    };
    this.publishStatusService.setPublishStatus(publishStatus);

    const isoLangCode = this.eavService.eavConfig.lang.split('-')[0];
    this.translate.use(isoLangCode);
    // Load language data only for parent dialog to not overwrite languages when opening child dialogs
    if (isParentDialog) {
      const langs = this.eavService.eavConfig.langs;
      const eavLangs: Language[] = Object.keys(langs).map(key => ({ key, name: langs[key] }));
      const sortedLanguages = sortLanguages(this.eavService.eavConfig.langPri, eavLangs);
      this.languageService.loadLanguages(sortedLanguages);
    }
    this.languageInstanceService.addLanguageInstance(
      formId,
      this.eavService.eavConfig.lang,
      this.eavService.eavConfig.langPri,
      this.eavService.eavConfig.lang,
      false,
    );

    // if current language !== default language check whether default language has value in all items
    if (this.eavService.eavConfig.lang !== this.eavService.eavConfig.langPri) {
      const valuesExistInDefaultLanguage = this.itemService.valuesExistInDefaultLanguage(
        itemGuids,
        this.eavService.eavConfig.langPri,
        this.inputTypeService,
        this.contentTypeService,
      );
      if (!valuesExistInDefaultLanguage) {
        this.languageInstanceService.updateCurrentLanguage(formId, this.eavService.eavConfig.langPri);
        const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: this.eavService.eavConfig.langPri });
        this.snackBar.open(message, null, { duration: 5000 });
      }
    }
  }

  private createFieldConfigs(): void {
    const manager = FieldLogicManager.singleton();
    const stringDefaultLogic = manager.get('string-default');
    stringDefaultLogic.init({} as any);
  }
}
