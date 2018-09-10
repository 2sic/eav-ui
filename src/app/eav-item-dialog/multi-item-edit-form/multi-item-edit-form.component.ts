import {
  Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef, AfterContentChecked, OnDestroy, Inject, AfterContentInit, AfterViewInit
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, zip, of, Subscription } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import 'reflect-metadata';
import * as fromItems from '../../shared/store/actions/item.actions';
import { Item, Language } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/services/content-type.service';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';
import { ItemService } from '../../shared/services/item.service';
import { EavService } from '../../shared/services/eav.service';
import { LanguageService } from '../../shared/services/language.service';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { TranslateService } from '@ngx-translate/core';
import { JsonItem1 } from '../../shared/models/json-format-v1';
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { InputTypeService } from '../../shared/services/input-type.service';
import { DialogTypeConstants } from '../../shared/constants/type-constants';
import { AdminDialogData } from '../../shared/models/eav/admin-dialog-data';
import { FeatureService } from '../../shared/services/feature.service';
import { Feature } from '../../shared/models/feature/feature';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.css']
})
export class MultiItemEditFormComponent implements OnInit, AfterContentChecked, OnDestroy {
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;

  closeWindow = false;
  currentLanguage$: Observable<string>;
  defaultLanguage$: Observable<string>;
  enableDraft = false;
  formErrors: { [key: string]: any }[] = [];
  formsAreValid = false;
  formSaveAllObservables$: Observable<Action>[] = [];
  items$: Observable<Item[]>;
  languages$: Observable<Language[]>;
  features$: Observable<Feature[]>;
  Object = Object;
  publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  versioningOptions;
  willPublish = false;     // default is won't publish, but will usually be overridden

  private subscriptions: Subscription[] = [];

  private eavConfig: EavConfiguration;

  constructor(public dialogRef: MatDialogRef<MultiItemEditFormComponent>,
    @Inject(MAT_DIALOG_DATA) private formDialogData: AdminDialogData,
    private actions$: Actions,
    private changeDetectorRef: ChangeDetectorRef,
    private contentTypeService: ContentTypeService,
    private eavService: EavService,
    private featureService: FeatureService,
    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private validationMessagesService: ValidationMessagesService) {
    this.currentLanguage$ = languageService.getCurrentLanguage();
    this.defaultLanguage$ = languageService.getDefaultLanguage();
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    // Read configuration from queryString
    this.eavConfig = this.eavService.getEavConfiguration();
    this.languageService.loadLanguages(JSON.parse(this.eavConfig.langs), this.eavConfig.lang, this.eavConfig.langpri, 'en-us');
  }

  ngOnInit() {
    this.loadItemsData();
    this.setLanguageConfig();
    // suscribe to form submit
    this.saveFormMessagesSubscribe();

    // Close dialog
    // this.afterClosedDialogSubscribe();
  }

  ngAfterContentChecked() {
    this.saveFormSuscribe();
    this.setFormsAreValid();
    // need this to detectChange this.formsAreValid after ViewChecked
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * observe formValue changes from all child forms
   */
  formValueChange() {
    this.setFormsAreValid();
    // reset form errors
    this.formErrors = [];
  }

  /**
 * save all forms
 */
  saveAll(close: boolean) {
    if (this.formsAreValid) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        itemEditFormComponent.form.submitOutside();
      });

      if (close) {
        this.closeWindow = true;
        // this.close();
      }
    } else {
      this.displayAllValidationMessages();
    }
  }

  trackByFn(index, item) {
    return item.entity.id === 0 ? item.entity.guid : item.entity.id;
  }

  private afterLoadItemsData(data: any) {
    this.itemService.loadItems(data.Items);
    this.inputTypeService.loadInputTypes(data.InputTypes);
    this.contentTypeService.loadContentTypes(data.ContentTypes);
    this.featureService.loadFeatures(data.Features);
    this.setPublishMode(data.Items, data.IsPublished, data.DraftShouldBranch);
    this.items$ = this.itemService.selectItemsByIdList(data.Items.map(item => (item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id)));
    this.features$ = this.featureService.selectFeatures();
  }

  /**
   * close (remove) iframe window
   */
  private closeDialog() {
    this.dialogRef.close();
  }

  /**
   * close (remove) iframe window
   */
  private closeIFrame() {
    (window.parent as any).$2sxc.totalPopup.close();
  }

  /**
   * Fill in all error validation messages from all forms
   */
  private displayAllValidationMessages() {
    this.formErrors = [];
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        if (itemEditFormComponent.form.form.invalid) {
          this.formErrors.push(this.validationMessagesService.validateForm(itemEditFormComponent.form.form, false));
        }
      });
    }
  }

  private getVersioningOptions() {
    if (!this.eavConfig.partOfPage) {
      return { show: true, hide: true, branch: true };
    }
    const req = this.eavConfig.publishing || '';
    switch (req) {
      case '':
      case 'DraftOptional': return { show: true, hide: true, branch: true };
      case 'DraftRequired': return { branch: true, hide: true };
      default: throw Error('invalid versioning requiremenets: ' + req.toString());
    }
  }

  /**
   * Load all data for forms
   */
  private loadItemsData() {
    const loadBody = this.setLoadBody(this.formDialogData.type);

    this.eavService.loadAllDataForForm(this.eavConfig.appId, loadBody).subscribe(data => {
      this.afterLoadItemsData(data);
    });
  }

  private setLoadBody(dialogType: string) {
    // if dialog type load with entity ids (edit - entity)
    if (dialogType === DialogTypeConstants.itemEditWithEntityId) {
      const entityId: number = Number(this.formDialogData.id);
      return `[{ 'EntityId': ${entityId} }]`;
    } else { // else dialog type load without entity ids. (edit - toolbar)
      return this.eavConfig.items;
    }
  }

  private setLanguageConfig() {
    this.setTranslateLanguage(this.eavConfig.lang);
    // UILanguage harcoded (for future usage)
    // this.languageService.loadLanguages(JSON.parse(this.eavConfig.langs), this.eavConfig.lang, this.eavConfig.langpri, 'en-us');

    this.languages$ = this.languageService.selectAllLanguages();
    // on current language change reset form errors
    this.subscriptions.push(this.currentLanguage$.subscribe(len => {
      this.formErrors = [];
    }));
  }

  /**
   * Set translate language of all forms
   * @param language
   *
   */
  private setTranslateLanguage(language: string) {
    if (language) {
      // TODO: find better solution
      const isoLangCode = language.substring(0, language.indexOf('-') > 0 ? language.indexOf('-') : 2);
      this.translate.use(isoLangCode);
    }
  }

  /**
   * With zip function look all forms submit observables and when all finish save all data (call savemany service)
   */
  private saveFormSuscribe() {
    // important - only subscribe once
    if (this.formSaveAllObservables$.length === 0) {
      if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
        this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
          this.formSaveAllObservables$.push(itemEditFormComponent.formSaveObservable());
        });
      }

      if (this.formSaveAllObservables$ && this.formSaveAllObservables$.length > 0) {
        this.subscriptions.push(
          zip(...this.formSaveAllObservables$)
            .pipe(
              switchMap((actions: fromItems.SaveItemAttributesValuesAction[]) => {
                console.log('ZIP ACTIONS ITEM: ', JsonItem1.create(actions[0].item));
                const allItems = [];
                actions.forEach(action => {
                  allItems.push(JsonItem1.create(action.item));
                });

                const body = {
                  Items: allItems,
                  IsPublished: this.publishMode === 'show',
                  DraftShouldBranch: this.publishMode === 'branch'
                };

                return this.eavService.savemany(this.eavConfig.appId, this.eavConfig.partOfPage, JSON.stringify(body))
                  .pipe(
                    map(data => {
                      this.enableDraft = true; // after saving, we can re-save as draft
                      this.eavService.saveItemSuccess(data);
                    }),
                    tap(data => console.log('working'))
                  );
              }),
              catchError(err => of(this.eavService.saveItemError(err)))
            )
            .subscribe()
        );
      }
    }
  }

  /**
   * display form messages on form success or form error
   */
  private saveFormMessagesSubscribe() {
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS)
      .subscribe((action: fromItems.SaveItemAttributesValuesSuccessAction) => {
        console.log('success END: ', action.data);
        // TODO show success message
        if (this.closeWindow) {
          this.closeIFrame();
        } else {
          this.snackBarOpen('saved');
        }
      }));
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_ERROR)
      .subscribe((action: fromItems.SaveItemAttributesValuesErrorAction) => {
        console.log('error END', action.error);
        // TODO show error message
        this.snackBarOpen('error');
      }));
  }

  /**
   * Open snackbar with message and after closed call function close
   * @param message
   * @param callClose
   */
  private snackBarOpen(message: string) {
    const snackBarRef = this.snackBar.open(message, '', {
      duration: 3000
    });

    //   this.closeDialog();
    //   snackBarRef.afterDismissed().subscribe(null, null, () => {
    //     this.closeIFrame();
    //   });
  }

  /**
   * Determines whether all forms are valid and sets a this.formsAreValid depending on it
   */
  private setFormsAreValid() {
    this.formsAreValid = false;
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.formsAreValid = true;
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        if (itemEditFormComponent.form.valid === false
          && (!itemEditFormComponent.item.header.group || itemEditFormComponent.item.header.group.slotCanBeEmpty === false)) {
          this.formsAreValid = false;
        }
      });
    }
  }

  private setPublishMode(items: JsonItem1[], isPublished: boolean, draftShouldBranch: boolean) {
    this.versioningOptions = this.getVersioningOptions();

    this.enableDraft = items[0].Header.EntityId !== 0; // it already exists, so enable draft
    this.publishMode = draftShouldBranch
      ? 'branch' // it's a branch, so it must have been saved as a draft-branch
      : isPublished ? 'show' : 'hide';

    // if publish mode is prohibited, revert to default
    if (!this.eavConfig.versioningOptions[this.publishMode]) {
      this.publishMode = Object.keys(this.eavConfig.versioningOptions)[0];
    }
  }
}

