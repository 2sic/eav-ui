import {
  Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef, AfterContentChecked, OnDestroy, Inject, AfterViewChecked
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, zip, of, Subscription } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material';

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
import { AdminDialogData } from '../../shared/models/eav/admin-dialog-data';
import { FeatureService } from '../../shared/services/feature.service';
import { Feature } from '../../shared/models/feature/feature';
import {
  SnackBarUnsavedChangesComponent
} from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import {
  trigger, state, style, transition,
  animate, keyframes, group
} from '@angular/animations';

export const SlideLeftRightAnimation = [
  trigger('slideLeft', [
    state('true', style({})),
    state('false', style({})),
    transition('void => *', animate(0)),
    transition('* => *',
      [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
          style({ transform: 'translateX(+10%)' }),
          style({ transform: 'translateX(+20%)' }),
          style({ transform: 'translateX(+30%)' }),
          style({ transform: 'translateX(+40%)' }),
          style({ transform: 'translateX(+50%)' }),
          style({ transform: 'translateX(+60%)' }),
          style({ transform: 'translateX(+70%)' }),
          style({ transform: 'translateX(+80%)' }),
          style({ transform: 'translateX(+90%)' }),
          style({ transform: 'translateX(+100%)' }),
          style({ transform: 'translateX(-100%)' }),
          style({ transform: 'translateX(-90%)' }),
          style({ transform: 'translateX(-80%)' }),
          style({ transform: 'translateX(-70%)' }),
          style({ transform: 'translateX(-60%)' }),
          style({ transform: 'translateX(-50%)' }),
          style({ transform: 'translateX(-40%)' }),
          style({ transform: 'translateX(-30%)' }),
          style({ transform: 'translateX(-20%)' }),
          style({ transform: 'translateX(-10%)' }),
        ])),
      ]
    ),
  ]),
  trigger('slideRight', [
    state('true', style({})),
    state('false', style({})),
    transition('void => *', animate(0)),
    transition('* => *', [
      animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
        style({ transform: 'translateX(-10%)' }),
        style({ transform: 'translateX(-20%)' }),
        style({ transform: 'translateX(-30%)' }),
        style({ transform: 'translateX(-40%)' }),
        style({ transform: 'translateX(-50%)' }),
        style({ transform: 'translateX(-60%)' }),
        style({ transform: 'translateX(-70%)' }),
        style({ transform: 'translateX(-80%)' }),
        style({ transform: 'translateX(-90%)' }),
        style({ transform: 'translateX(-100%)' }),
        style({ transform: 'translateX(+100%)' }),
        style({ transform: 'translateX(+90%)' }),
        style({ transform: 'translateX(+80%)' }),
        style({ transform: 'translateX(+70%)' }),
        style({ transform: 'translateX(+60%)' }),
        style({ transform: 'translateX(+50%)' }),
        style({ transform: 'translateX(+40%)' }),
        style({ transform: 'translateX(+30%)' }),
        style({ transform: 'translateX(+20%)' }),
        style({ transform: 'translateX(+10%)' }),
      ])),
    ]),
  ]),
];

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.scss'],
  animations: [SlideLeftRightAnimation]
})
export class MultiItemEditFormComponent implements OnInit, AfterContentChecked, OnDestroy, AfterViewChecked {
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;

  animationStateLeft: string;
  animationStateRight: string;

  formIsSaved = false;
  currentLanguage$: Observable<string>;
  currentLanguage: string;
  defaultLanguage$: Observable<string>;
  enableDraft = false;

  formErrors: { [key: string]: any }[] = [];
  formsAreValid = false;
  formsAreDirty = {};
  allControlsAreDisabled = true;

  formSaveAllObservables$: Observable<Action>[] = [];
  items$: Observable<Item[]>;
  languages$: Observable<Language[]>;
  languages: Language[];
  features$: Observable<Feature[]>;
  Object = Object;
  publishMode = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  versioningOptions;
  willPublish = false;     // default is won't publish, but will usually be overridden
  extendedSaveButtonIsReduced = false;

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
    this.reduceExtendedSaveButton();

    this.dialogBackdropClickSubscribe();
    this.saveFormMessagesSubscribe();
    this.formSetValueChangeSubscribe();
  }

  ngAfterContentChecked() {
    this.saveFormSuscribe();
    // this.checkFormsState();
    // need this to detectChange for this.formsAreValid after ViewChecked
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewChecked() {
    // need this to detectChange for this.formsAreValid
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscriber => subscriber.unsubscribe());
  }

  /**
   * observe formValue changes from all child forms
   */
  formValueChange() {
    this.checkFormsState();
    // reset form errors
    this.formErrors = [];
  }


  /**
   * close form dialog or if close is disabled show a message
   */
  closeDialog() {
    if (this.dialogRef.disableClose) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close();
    }
  }

  /**
   * * save all forms
   */
  saveAll(close: boolean) {
    if (this.formsAreValid || this.allControlsAreDisabled) {
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        itemEditFormComponent.form.submitOutside();
      });
      console.log('saveAll', close);

      if (close) {
        this.formIsSaved = true;
      }
    } else {
      this.displayAllValidationMessages();
    }
  }

  trackByFn(index, item) {
    return item.entity.id === 0 ? item.entity.guid : item.entity.id;
  }

  /**
   * after a data load is finished load all that data to form
   * @param data
   */
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
   * Determine is from is dirty on any language. If any form is dirty we need to ask to save.
   */
  private areFormsDirtyAnyLanguage() {
    let isDirty = false;
    Object.keys(this.formsAreDirty).forEach(key => {
      if (this.formsAreDirty[key] === true) {
        isDirty = true;
      }
    });
    return isDirty;
  }

  private dialogBackdropClickSubscribe() {
    this.dialogRef.backdropClick().subscribe(result => {
      this.closeDialog();
    });
  }

  /**
   * close (remove) iframe window
   */
  // private closeIFrame() {
  //   (window.parent as any).$2sxc.totalPopup.close();
  // }

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

  private formSetValueChangeSubscribe() {
    this.subscriptions.push(this.eavService.formSetValueChange$.subscribe((item) => {
      this.checkFormsState();
    }));
  }

  /**
   * Load all data for forms
   */
  private loadItemsData() {
    const loadBody = this.formDialogData.item || this.eavConfig.items;

    this.eavService.loadAllDataForForm(this.eavConfig.appId, loadBody).subscribe(data => {
      this.afterLoadItemsData(data);
    });
  }

  private setLanguageConfig() {
    this.setTranslateLanguage(this.eavConfig.lang);
    // UILanguage harcoded (for future usage)
    // this.languageService.loadLanguages(JSON.parse(this.eavConfig.langs), this.eavConfig.lang, this.eavConfig.langpri, 'en-us');

    this.languages$ = this.languageService.selectAllLanguages();
    this.subscriptions.push(this.languages$.subscribe(languages => {
      this.languages = languages;
    }));

    this.subscriptions.push(this.currentLanguage$.subscribe(lan => {
      this.changeAnimationState(lan);
      this.currentLanguage = lan;
      // on current language change reset form errors
      this.formErrors = [];
    }));
  }

  private changeAnimationState(language: string) {
    if (this.languages.findIndex(l => l.key === this.currentLanguage) > this.languages.findIndex(l => l.key === language)) {
      this.animationStateLeft = this.animationStateLeft === 'false' ? 'true' : 'false';
    } else {
      this.animationStateRight = this.animationStateRight === 'false' ? 'true' : 'false';
    }
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
   *  imortant: this is subscribed to an all open dialogs, a forms are distinguished by this.formIsSaved variable
   *  TODO :need to distinguished form by forms data
   */
  private saveFormMessagesSubscribe() {
    this.subscriptions.push(this.actions$
      .ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS)
      .subscribe((action: fromItems.SaveItemAttributesValuesSuccessAction) => {
        console.log('success END: ', action.data);
        if (this.formIsSaved) {
          this.dialogRef.disableClose = false;
          this.closeDialog();
          this.snackBarOpen('saved');
        }
        // else {
        //   console.log('success END: saveFormMessagesSubscribe saved');
        //   // child dialogs
        //   this.snackBarOpen('saved');
        // }
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
   * First set form state then read state in get method
   */
  private checkFormsState() {
    this.setFormState();
    this.getFormState();
  }

  private setFormState() {
    if (this.itemEditFormComponentQueryList &&
      this.itemEditFormComponentQueryList.length > 0 &&
      this.itemEditFormComponentQueryList.first.currentLanguage) {

      // Default values
      this.allControlsAreDisabled = true;
      this.formsAreValid = true;
      this.formsAreDirty[this.itemEditFormComponentQueryList.first.currentLanguage] = false;
      this.itemEditFormComponentQueryList.forEach((itemEditFormComponent: ItemEditFormComponent) => {
        // set form valid
        if (itemEditFormComponent.form.valid === false
          && (!itemEditFormComponent.item.header.group || itemEditFormComponent.item.header.group.slotCanBeEmpty === false)) {
          this.formsAreValid = false;
        }

        // set form dirty
        if (itemEditFormComponent.form.dirty) {
          this.formsAreDirty[itemEditFormComponent.currentLanguage] = true;
        }

        // set all form are disabled
        if (!itemEditFormComponent.allControlsAreDisabled) {
          this.allControlsAreDisabled = false;
        }
      });
    }
  }

  private getFormState() {
    this.dialogRef.disableClose = this.areFormsDirtyAnyLanguage();
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

  /**
   * Open snackbar with message and after closed call function close
   * @param message
   * @param callClose
   */
  private snackBarOpen(message: string) {
    const snackBarRef = this.snackBar.open(message, '', {
      duration: 3000
    });
  }

  /**
  Open snackbar when snack bar not saved
  */
  public snackBarYouHaveUnsavedChanges() {
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data: { save: false },
      duration: 5000
    });

    snackBarRef.onAction().subscribe(s => {
      if (snackBarRef.containerInstance.snackBarConfig.data.save) {
        this.saveAll(true);
      } else {
        this.dialogRef.disableClose = false;
        this.closeDialog();
      }
    });
  }

  private reduceExtendedSaveButton() {
    setTimeout(() => {
      this.extendedSaveButtonIsReduced = true;
    }, 5000);
  }
}

