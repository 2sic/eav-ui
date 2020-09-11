// tslint:disable-next-line:max-line-length
import { Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef, OnDestroy, AfterViewChecked, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Action } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Observable, zip, of, Subscription, BehaviorSubject, merge, fromEvent } from 'rxjs';
import { switchMap, map, tap, catchError, take, pairwise, filter, delay } from 'rxjs/operators';
import 'reflect-metadata';

import * as fromItems from '../../shared/store/actions/item.actions';
import { Item, Language } from '../../shared/models/eav';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { GlobalConfigurationService } from '../../shared/services/global-configuration.service';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { EavService } from '../../shared/services/eav.service';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { JsonItem1 } from '../../shared/models/json-format-v1';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { FeatureService } from '../../shared/store/ngrx-data/feature.service';
import { SnackBarUnsavedChangesComponent } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { SnackBarSaveErrorsComponent } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldErrorMessage } from '../../shared/models/eav/field-error-message';
import { LoadIconsService } from '../../shared/services/load-icons.service';
import { sortLanguages, calculateIsParentDialog } from './multi-item-edit-form.helpers';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { UnsavedChangesSnackData } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';
import { SaveErrorsSnackData } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.models';
import { PublishMode, PublishModeConstants } from './multi-item-edit-form.constants';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { EditParams } from '../../edit-matcher.models';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiItemEditFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren(ItemEditFormComponent) private itemEditFormRefs: QueryList<ItemEditFormComponent>;
  @ViewChild('slideable') private slideableRef: ElementRef<HTMLDivElement>;

  isParentDialog = calculateIsParentDialog(this.route);
  formId = Math.floor(Math.random() * 99999);
  formsAreValid$ = new BehaviorSubject(false);
  allControlsAreDisabled$ = new BehaviorSubject(true);
  items$: Observable<Item[]>;

  publishMode$ = new BehaviorSubject<PublishMode>('hide');
  reduceSaveButton$ = new BehaviorSubject(false);
  hideHeader$ = this.languageInstanceService.getHideHeader(this.formId);
  debugEnabled$ = this.globalConfigurationService.getDebugEnabled().pipe(
    tap(debugEnabled => {
      if (this.debugInfoIsOpen$.value && !debugEnabled) {
        this.debugInfoIsOpen$.next(false);
      }
    })
  );
  debugInfoIsOpen$ = new BehaviorSubject(false);
  slide$: Observable<string>;
  eavConfigLoaded$ = new BehaviorSubject(false);

  private formErrors: { [key: string]: string }[] = [];
  private formsAreDirty: { [key: string]: boolean } = {};
  private formSaveAllObservables$: Observable<Action>[] = [];
  private createMode = false;
  private formIsSaved = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<MultiItemEditFormComponent>,
    private actions$: Actions,
    private changeDetectorRef: ChangeDetectorRef,
    private contentTypeService: ContentTypeService,
    private globalConfigurationService: GlobalConfigurationService,
    private eavService: EavService,
    private featureService: FeatureService,
    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private validationMessagesService: ValidationMessagesService,
    private loadIconsService: LoadIconsService,
    private route: ActivatedRoute,
    private editRoutingService: EditRoutingService,
  ) {
    this.editRoutingService.init(this.route, this.formId);
    this.loadIconsService.load();
  }

  ngOnInit() {
    this.fetchFormData();
  }

  ngAfterViewChecked() {
    this.attachAllSaveFormObservables();
    this.changeDetectorRef.detectChanges(); // 2020-06-19 SPM TODO: remove when form is stable. ATM a whole lot of stuff breaks without it
    this.initSlider();
  }

  ngOnDestroy() {
    this.reduceSaveButton$.complete();
    this.debugInfoIsOpen$.complete();
    this.formsAreValid$.complete();
    this.allControlsAreDisabled$.complete();
    this.publishMode$.complete();
    this.eavConfigLoaded$.complete();
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.languageInstanceService.removeLanguageInstance(this.formId);

    if (this.isParentDialog) {
      // clear the rest of the store
      this.languageInstanceService.clearCache();
      this.languageService.clearCache();
      this.itemService.clearCache();
      this.inputTypeService.clearCache();
      this.featureService.clearCache();
      this.contentTypeService.clearCache();
    }
  }

  toggleDebugEnabled(event: MouseEvent) {
    const CTRL_SHIFT_ALT_CLICK = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.shiftKey && event.altKey;
    if (CTRL_SHIFT_ALT_CLICK) {
      this.globalConfigurationService.toggleDebugEnabled();
    }
  }

  /** Close form dialog or if close is disabled show a message */
  closeDialog(saveResult?: any) {
    if (this.dialogRef.disableClose) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close(this.createMode ? saveResult : undefined);
    }
  }

  setPublishMode(publishMode: PublishMode) {
    // if publish mode is prohibited, revert to default
    if (this.eavService.eavConfig.versioningOptions[publishMode] == null) {
      publishMode = Object.keys(this.eavService.eavConfig.versioningOptions)[0] as PublishMode;
    }
    this.publishMode$.next(publishMode);
  }

  trackByFn(index: number, item: Item) {
    return item.entity.id === 0 ? item.entity.guid : item.entity.id;
  }

  formValueChange() {
    this.checkFormsState();
    this.formErrors = [];
  }

  /** Save all forms */
  saveAll(close: boolean) {
    this.eavService.forceConnectorSave$.next();
    // start gathering submit data with a timeout to let custom components which run outside Angular zone to save their values
    setTimeout(() => {
      if (this.formsAreValid$.value || this.allControlsAreDisabled$.value) {
        this.itemEditFormRefs.forEach(itemEditFormComponent => {
          itemEditFormComponent.form.submitOutside();
        });
        angularConsoleLog('saveAll', close);
        this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });
        if (close) { this.formIsSaved = true; }
      } else {
        this.calculateAllValidationMessages();
        const fieldErrors: FieldErrorMessage[] = [];
        this.formErrors.forEach(formError => {
          Object.keys(formError).forEach(key => {
            fieldErrors.push({ field: key, message: formError[key] });
          });
        });
        const data: SaveErrorsSnackData = {
          fieldErrors,
        };
        this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
          data,
          duration: 5000,
        });
      }
    }, 100);
  }

  debugInfoOpened(opened: boolean) {
    this.debugInfoIsOpen$.next(opened);
  }

  private fetchFormData() {
    const form = convertUrlToForm((this.route.snapshot.params as EditParams).items);
    const editItems = JSON.stringify(form.items);
    this.eavService.fetchFormData(editItems).subscribe(formData => {
      setTimeout(() => { this.reduceSaveButton$.next(true); }, 5000);
      this.itemService.loadItems(formData.Items);
      // we assume that input type and content type data won't change between loading parent and child forms
      this.inputTypeService.addInputTypes(formData.InputTypes);
      this.contentTypeService.addContentTypes(formData.ContentTypes);
      this.featureService.loadFeatures(formData.Features);

      this.eavService.setEavConfig(formData.Context);
      this.eavConfigLoaded$.next(true);
      const isoLangCode = this.eavService.eavConfig.lang.split('-')[0];
      this.translate.use(isoLangCode);
      // Load language data only for parent dialog to not overwrite languages when opening child dialogs
      if (this.isParentDialog) {
        const langs = this.eavService.eavConfig.langs;
        const eavLangs: Language[] = Object.keys(langs).map(key => ({ key, name: langs[key] }));
        const sortedLanguages = sortLanguages(this.eavService.eavConfig.langPri, eavLangs);
        this.languageService.loadLanguages(sortedLanguages);
      }
      this.languageInstanceService.addLanguageInstance(this.formId, this.eavService.eavConfig.lang,
        this.eavService.eavConfig.langPri, this.eavService.eavConfig.lang, false);

      const publishMode: PublishMode = formData.DraftShouldBranch
        ? PublishModeConstants.Branch
        : formData.IsPublished ? PublishModeConstants.Show : PublishModeConstants.Hide;
      this.setPublishMode(publishMode);

      // if current language !== default language check whether default language has value in all items
      if (this.eavService.eavConfig.lang !== this.eavService.eavConfig.langPri) {
        const valuesExistInDefaultLanguage = this.itemService.valuesExistInDefaultLanguage(
          formData.Items.map(item => (item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id)),
          this.eavService.eavConfig.langPri,
          this.inputTypeService,
          this.contentTypeService,
        );
        if (!valuesExistInDefaultLanguage) {
          this.languageInstanceService.updateCurrentLanguage(this.formId, this.eavService.eavConfig.langPri);
          const message = this.translate.instant('Message.SwitchedLanguageToDefault', { language: this.eavService.eavConfig.langPri });
          this.snackBar.open(message, null, { duration: 5000 });
        }
      }

      this.items$ = this.itemService.selectItemsByIdList(
        formData.Items.map(item => (item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id))
      );
      this.items$.pipe(take(1)).subscribe(items => {
        if (items?.length > 0 && items[0].entity.id === 0) {
          this.createMode = true;
        }
      });

      this.languageChangeSubscribe();
      this.dialogBackdropClickSubscribe();
      this.saveFormMessagesSubscribe();
      this.formSetValueChangeSubscribe();
    });
  }

  private initSlider() {
    if (this.slideableRef == null || this.slide$ != null) { return; }
    this.slide$ = merge(
      this.languageInstanceService.getCurrentLanguage(this.formId).pipe(
        pairwise(),
        map(([previousLang, currentLang]) => {
          let languages: Language[];
          this.languageService.entities$.pipe(take(1)).subscribe(langs => {
            languages = langs;
          });
          const previousLangIndex = languages.findIndex(lang => lang.key === previousLang);
          const currentLangIndex = languages.findIndex(lang => lang.key === currentLang);
          const slide = (previousLangIndex > currentLangIndex) ? 'previous' : 'next';
          return slide;
        }),
      ),
      fromEvent(this.slideableRef.nativeElement, 'animationend').pipe(
        filter((event: AnimationEvent) => event.animationName === 'move-next' || event.animationName === 'move-previous'),
        map(() => ''),
        delay(0), // small delay because animationend fires a bit too early
      ),
    );
  }

  private languageChangeSubscribe() {
    this.subscriptions.push(
      this.languageInstanceService.getCurrentLanguage(this.formId).subscribe(language => {
        this.formErrors = []; // on current language change reset form errors
      }),
    );
  }

  private dialogBackdropClickSubscribe() {
    this.subscriptions.push(
      fromEvent(window, 'beforeunload').subscribe((event: BeforeUnloadEvent) => {
        if (!this.dialogRef.disableClose) { return; }
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.snackBarYouHaveUnsavedChanges();
      })
    );

    this.dialogRef.backdropClick().subscribe(event => {
      this.closeDialog();
    });

    this.dialogRef.keydownEvents().subscribe(event => {
      const ESCAPE = event.keyCode === 27;
      if (ESCAPE) {
        this.closeDialog();
        return;
      }
      const CTRL_S = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.keyCode === 83;
      if (CTRL_S) {
        event.preventDefault();
        this.saveAll(false);
      }
    });
  }

  /**
   * Display form messages on form success or form error.
   * Imortant: this is subscribed to an all open dialogs, a forms are distinguished by this.formIsSaved variable.
   * TODO: need to distinguished form by forms data
   */
  private saveFormMessagesSubscribe() {
    this.subscriptions.push(
      this.actions$
        .pipe(ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS))
        .subscribe((action: fromItems.SaveItemAttributesValuesSuccessAction) => {
          this.itemService.updateItemId(action.data);
          angularConsoleLog('success END: ', action.data);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.dialogRef.disableClose = false;
          if (this.formIsSaved) {
            this.closeDialog(action.data);
          }
        })
    );
    this.subscriptions.push(
      this.actions$
        .pipe(ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_ERROR))
        .subscribe((action: fromItems.SaveItemAttributesValuesErrorAction) => {
          angularConsoleLog('error END', action.error);
          this.snackBar.open('Error', null, { duration: 2000 });
        })
    );
  }

  private formSetValueChangeSubscribe() {
    this.subscriptions.push(
      this.eavService.formValueChange$.pipe(
        filter(formSet => formSet.formId === this.formId)
      ).subscribe(formSet => {
        this.checkFormsState();
      })
    );
  }

  private checkFormsState() {
    if (this.itemEditFormRefs?.length > 0 && this.itemEditFormRefs?.first.currentLanguage) {
      let formsAreValid = true;
      let allControlsAreDisabled = true;
      this.formsAreDirty[this.itemEditFormRefs.first.currentLanguage] = false;

      this.itemEditFormRefs.forEach(itemEditFormComponent => {
        if (
          itemEditFormComponent.form.form.invalid === true
          && (!itemEditFormComponent.item.header.Group || itemEditFormComponent.item.header.Group.SlotCanBeEmpty === false)
        ) {
          formsAreValid = false;
        }
        if (itemEditFormComponent.form.form.dirty) {
          this.formsAreDirty[itemEditFormComponent.currentLanguage] = true;
        }
        if (!itemEditFormComponent.checkAreAllControlsDisabled()) {
          allControlsAreDisabled = false;
        }
      });

      if (this.formsAreValid$.value !== formsAreValid) {
        this.formsAreValid$.next(formsAreValid);
      }

      if (this.allControlsAreDisabled$.value !== allControlsAreDisabled) {
        this.allControlsAreDisabled$.next(allControlsAreDisabled);
      }
    }
    this.dialogRef.disableClose = this.areFormsDirtyAnyLanguage();
  }

  /** Determine is from is dirty on any language. If any form is dirty we need to ask to save */
  private areFormsDirtyAnyLanguage() {
    let isDirty = false;
    const langKeys = Object.keys(this.formsAreDirty);
    for (const langKey of langKeys) {
      if (this.formsAreDirty[langKey] === true) {
        isDirty = true;
        break;
      }
    }
    return isDirty;
  }

  /** Fill in all error validation messages from all forms */
  private calculateAllValidationMessages() {
    this.formErrors = [];
    this.itemEditFormRefs?.forEach(itemEditFormComponent => {
      if (!itemEditFormComponent.form.form.invalid) { return; }
      this.formErrors.push(this.validationMessagesService.validateForm(itemEditFormComponent.form.form, false));
    });
  }

  /**
   * Attach all save form observables from child itemEditFormComponent and
   * subscribe to all observables with one subscribe (observable zip function).
   * It also initially checks the status of the form (invalid, dirty ...)
   */
  private attachAllSaveFormObservables() {
    if (this.formSaveAllObservables$.length === 0) {
      this.itemEditFormRefs?.forEach(itemEditFormComponent => {
        this.formSaveAllObservables$.push(itemEditFormComponent.formSaveObservable());
      });

      // only called once when a formSaveAllObservables array is filled
      if (this.formSaveAllObservables$.length > 0) {
        this.saveFormSubscribe();
        this.checkFormsState();
      }
    }
  }

  /** With zip function look all forms submit observables and when all finish save all data */
  private saveFormSubscribe() {
    this.subscriptions.push(
      zip(...this.formSaveAllObservables$)
        .pipe(
          switchMap((actions: fromItems.SaveItemAttributesValuesAction[]) => {
            angularConsoleLog('ZIP ACTIONS ITEM: ', JsonItem1.create(actions[0].item));
            const allItems: JsonItem1[] = [];
            actions.forEach(action => {
              const item = JsonItem1.create(action.item);
              // do not try to save item which doesn't have any fields, nothing could have changed about it
              if (Object.keys(item.Entity.Attributes).length > 0) {
                allItems.push(item);
              }
            });
            const body = {
              Items: allItems,
              IsPublished: this.publishMode$.value === PublishModeConstants.Show,
              DraftShouldBranch: this.publishMode$.value === PublishModeConstants.Branch,
            };
            return this.eavService.saveFormData(JSON.stringify(body)).pipe(
              map(data => {
                this.eavService.saveItemSuccess(data);
              }),
              tap(data => angularConsoleLog('working'))
            );
          }),
          catchError(err => of(this.eavService.saveItemError(err)))
        )
        .subscribe()
    );
  }

  /** Open snackbar when snack bar not saved */
  public snackBarYouHaveUnsavedChanges() {
    const data: UnsavedChangesSnackData = {
      save: false,
    };
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data,
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if (snackBarRef.containerInstance.snackBarConfig.data.save) {
        this.saveAll(true);
      } else {
        this.dialogRef.disableClose = false;
        this.closeDialog();
      }
    });
  }

}
