// tslint:disable-next-line:max-line-length
import { Component, OnInit, QueryList, ViewChildren, ChangeDetectorRef, OnDestroy, AfterViewChecked, NgZone, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, zip, of, Subscription } from 'rxjs';
import { switchMap, map, tap, catchError, take } from 'rxjs/operators';
import { Action } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

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
import { EavConfiguration } from '../../shared/models/eav-configuration';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { FeatureService } from '../../shared/store/ngrx-data/feature.service';
// tslint:disable-next-line:max-line-length
import { SnackBarUnsavedChangesComponent } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { SnackBarSaveErrorsComponent } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldErrorMessage } from '../../shared/models/eav/field-error-message';
import { LoadIconsService } from '../../shared/services/load-icons.service';
import { sortLanguages, calculateIsParentDialog } from './multi-item-edit-form.helpers';
import { ElementEventListener } from '../../../shared/element-event-listener.model';
import { VersioningOptions } from '../../shared/models/eav/versioning-options';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { ExpandableFieldService } from '../../shared/services/expandable-field.service';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.scss'],
})
export class MultiItemEditFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren(ItemEditFormComponent) itemEditFormComponentQueryList: QueryList<ItemEditFormComponent>;
  @ViewChild('slideable') slideableRef: ElementRef;

  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;
  private createMode = false;
  slide = 'initial';
  slideListenersAdded = false;

  formIsSaved = false;
  isParentDialog: boolean;
  formId = Math.floor(Math.random() * 99999);
  currentLanguage$: Observable<string>;
  currentLanguage: string;
  enableDraft = false;

  formErrors: { [key: string]: any }[] = [];
  formsAreValid = false;
  formsAreDirty: { [key: string]: boolean } = {};
  allControlsAreDisabled = true;

  formSaveAllObservables$: Observable<Action>[] = [];
  items$: Observable<Item[]>;
  languages$: Observable<Language[]>;
  languages: Language[];
  publishMode: 'branch' | 'show' | 'hide' = 'hide';    // has 3 modes: show, hide, branch (where branch is a hidden, linked clone)
  versioningOptions: VersioningOptions;
  willPublish = false;     // default is won't publish, but will usually be overridden
  extendedSaveButtonIsReduced = false;
  debugEnabled = false;
  debugInfoIsOpen = false;
  eventListeners: ElementEventListener[] = [];
  hideHeader: boolean;

  constructor(
    private dialogRef: MatDialogRef<MultiItemEditFormComponent, any>,
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
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private context: Context,
    private expandableFieldService: ExpandableFieldService,
  ) {
    // Read configuration from queryString
    this.eavService.setEavConfiguration(this.route, this.context);
    this.eavConfig = this.eavService.getEavConfiguration();
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    // Load language data only for parent dialog to not overwrite languages when opening child dialogs
    this.expandableFieldService.init(this.route);
    this.isParentDialog = calculateIsParentDialog(this.route);
    if (this.isParentDialog) {
      const sortedLanguages = sortLanguages(this.eavConfig.langpri, JSON.parse(this.eavConfig.langs));
      this.languageService.loadLanguages(sortedLanguages);
    }
    this.languageInstanceService.addLanguageInstance(this.formId, this.eavConfig.lang, this.eavConfig.langpri, this.eavConfig.lang, false);
    this.currentLanguage = this.eavConfig.lang;
    this.loadIconsService.load();
  }

  ngOnInit() {
    this.languages$ = this.languageService.entities$;
    this.currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.formId);
    this.loadItemsData(); // can change current language to default if there is no value in default language
    this.setLanguageConfig();
    this.reduceExtendedSaveButton();

    this.dialogBackdropClickSubscribe();
    this.saveFormMessagesSubscribe();
    this.formSetValueChangeSubscribe();

    this.checkFormsState();
    this.loadDebugEnabled();
    this.hideHeaderSubscribe();
  }

  ngAfterViewChecked() {
    this.attachAllSaveFormObservables();
    this.changeDetectorRef.detectChanges(); // 2020-06-19 SPM TODO: remove when form is stable. ATM a whole lot of stuff breaks without it
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.expandableFieldService.destroy();
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
    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
  }

  toggleDebugEnabled(event: MouseEvent) {
    const enableDebugEvent = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.shiftKey && event.altKey;
    if (enableDebugEvent) { this.globalConfigurationService.toggleDebugEnabled(); }
  }

  debugInfoOpened(opened: boolean) {
    this.debugInfoIsOpen = opened;
  }

  /** Observe formValue changes from all child forms */
  formValueChange(event: Event) {
    this.checkFormsState();
    // reset form errors
    this.formErrors = [];
  }

  /** Close form dialog or if close is disabled show a message */
  closeDialog(saveResult?: any) {
    if (this.dialogRef.disableClose) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close(this.createMode ? saveResult : undefined);
    }
  }

  /** Save all forms */
  saveAll(close: boolean) {
    this.eavService.forceConnectorSave$.next();
    // start gathering submit data with a timeout to let custom components which run outside Angular zone to save their values
    setTimeout(() => {
      if (this.formsAreValid || this.allControlsAreDisabled) {
        this.itemEditFormComponentQueryList.forEach(itemEditFormComponent => {
          itemEditFormComponent.form.submitOutside();
        });
        angularConsoleLog('saveAll', close);
        this.snackBarOpen(this.translate.instant('Message.Saving'));
        if (close) { this.formIsSaved = true; }
      } else {
        this.calculateAllValidationMessages();
        const fieldErrors: FieldErrorMessage[] = [];
        this.formErrors.forEach(formError => {
          Object.keys(formError).forEach(key => {
            fieldErrors.push({ field: key, message: formError[key] });
          });
        });
        this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
          data: { fieldErrors },
          duration: 5000,
        });
      }
    }, 100);
  }

  trackByFn(index: number, item: Item) {
    return item.entity.id === 0 ? item.entity.guid : item.entity.id;
  }

  /** After a data load is finished load all that data to form */
  private afterLoadItemsData(data: any) {
    this.itemService.loadItems(data.Items);
    // we assume that input type and content type data won't change between loading parent and child forms
    this.inputTypeService.addInputTypes(data.InputTypes);
    this.contentTypeService.addContentTypes(data.ContentTypes);
    this.featureService.loadFeatures(data.Features);
    this.setPublishMode(data.Items, data.IsPublished, data.DraftShouldBranch);
    // if current language !== default language check whether default language has value in all items
    if (this.eavConfig.lang !== this.eavConfig.langpri) {
      const valuesExistInDefaultLanguage = this.itemService.valuesExistInDefaultLanguage(
        data.Items.map((item: JsonItem1) => (item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id)),
        this.eavConfig.langpri,
        this.inputTypeService,
        this.contentTypeService,
      );
      if (!valuesExistInDefaultLanguage) {
        this.languageInstanceService.updateCurrentLanguage(this.formId, this.eavConfig.langpri);
        this.snackBarOpen(this.translate.instant('Message.SwitchedLanguageToDefault', { language: this.eavConfig.langpri }), 5000);
      }
    }
    this.items$ = this.itemService.selectItemsByIdList(
      data.Items.map((item: JsonItem1) => (item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id))
    );
    this.items$.pipe(take(1)).subscribe(items => {
      if (items && items.length && items[0].entity.id === 0) {
        this.createMode = true;
      }
    });
  }

  /** Determine is from is dirty on any language. If any form is dirty we need to ask to save */
  private areFormsDirtyAnyLanguage() {
    let isDirty = false;
    Object.keys(this.formsAreDirty).forEach(key => {
      if (this.formsAreDirty[key] === true) { isDirty = true; }
    });
    return isDirty;
  }

  private dialogBackdropClickSubscribe() {
    const windowBeforeUnloadBound = this.windowBeforeUnload.bind(this);
    window.addEventListener('beforeunload', windowBeforeUnloadBound);
    this.eventListeners.push({ element: window, type: 'beforeunload', listener: windowBeforeUnloadBound });
    this.dialogRef.backdropClick().subscribe(e => { this.closeDialog(); });

    // spm Bind save events here
    this.dialogRef.keydownEvents().subscribe(e => {
      // escape key
      if (e.keyCode === 27) { this.closeDialog(); }
      // CTRL + S
      if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        this.saveAll(false);
      }
    });
  }

  private windowBeforeUnload(e: BeforeUnloadEvent) {
    if (!this.dialogRef.disableClose) { return; }
    // Cancel the event
    e.preventDefault();
    // Chrome requires returnValue to be set
    e.returnValue = '';
    this.snackBarYouHaveUnsavedChanges();
  }

  /** Fill in all error validation messages from all forms */
  private calculateAllValidationMessages() {
    this.formErrors = [];
    if (this.itemEditFormComponentQueryList && this.itemEditFormComponentQueryList.length > 0) {
      this.itemEditFormComponentQueryList.forEach(itemEditFormComponent => {
        if (itemEditFormComponent.form.form.invalid) {
          this.formErrors.push(this.validationMessagesService.validateForm(itemEditFormComponent.form.form, false));
        }
      });
    }
  }

  private getVersioningOptions(): VersioningOptions {
    if (!this.eavConfig.partOfPage) { return { show: true, hide: true, branch: true }; }

    const req = this.eavConfig.publishing || '';
    switch (req) {
      case '':
      case 'DraftOptional': return { show: true, hide: true, branch: true };
      case 'DraftRequired': return { branch: true, hide: true };
      default: throw Error('invalid versioning requiremenets: ' + req.toString());
    }
  }

  private formSetValueChangeSubscribe() {
    this.subscriptions.push(
      this.eavService.formValueChange$.subscribe(formSet => {
        // check if update is for current entity
        if (formSet.formId !== this.formId) { return; }
        this.checkFormsState();
      })
    );
  }

  /** Load all data for forms */
  private loadItemsData() {
    this.eavService.loadAllDataForForm(this.eavConfig.appId, this.eavConfig.items).subscribe(data => {
      this.afterLoadItemsData(data);
    });
  }

  private setLanguageConfig() {
    this.setTranslateLanguage(this.eavConfig.lang);

    this.subscriptions.push(
      this.languages$.subscribe(languages => {
        this.languages = languages;
      }),
      this.currentLanguage$.subscribe(lan => {
        this.changeAnimationState(lan);
        this.currentLanguage = lan;
        // on current language change reset form errors
        this.formErrors = [];
      }),
    );
  }

  private changeAnimationState(language: string) {
    const currentLangIndex = this.languages.findIndex(l => l.key === this.currentLanguage);
    const newLangIndex = this.languages.findIndex(l => l.key === language);
    if (currentLangIndex > newLangIndex) {
      this.slide = 'previous';
    } else if (currentLangIndex < newLangIndex) {
      this.slide = 'next';
    }

    if (this.slideableRef && this.slideableRef.nativeElement) {
      this.ngZone.runOutsideAngular(() => {
        if (this.slideableRef.nativeElement.classList.contains(this.slide)) {
          // if animation is in the same direction add timeout for browser to reset animation
          this.slideableRef.nativeElement.classList.remove('next');
          this.slideableRef.nativeElement.classList.remove('previous');
          setTimeout(() => { this.slideableRef.nativeElement.classList.add(this.slide); }, 100);
        } else {
          this.slideableRef.nativeElement.classList.remove('next');
          this.slideableRef.nativeElement.classList.remove('previous');
          this.slideableRef.nativeElement.classList.add(this.slide);
        }

        if (!this.slideListenersAdded) {
          this.slideListenersAdded = true;
          const slideAnimationEndBound = this.slideAnimationEnd.bind(this);
          this.slideableRef.nativeElement.addEventListener('webkitAnimationEnd', slideAnimationEndBound);
          this.slideableRef.nativeElement.addEventListener('animationend', slideAnimationEndBound);
          this.eventListeners.push(
            { element: window, type: 'beforeunload', listener: slideAnimationEndBound },
            { element: window, type: 'beforeunload', listener: slideAnimationEndBound },
          );
        }
      });
    }
  }

  private slideAnimationEnd() {
    setTimeout(() => {
      this.slideableRef.nativeElement.classList.remove('previous');
      this.slideableRef.nativeElement.classList.remove('next');
    }, 100);
  }

  /** Set translate language of all forms */
  private setTranslateLanguage(language: string) {
    if (language) {
      // TODO: find better solution
      const isoLangCode = language.substring(0, language.indexOf('-') > 0 ? language.indexOf('-') : 2);
      this.translate.use(isoLangCode);
    }
  }

  /**
   * Attach all save form observables from child itemEditFormComponent and
   * subscribe to all observables with one subscribe (observable zip function).
   * It also initially checks the status of the form (invalid, dirty ...)
   */
  private attachAllSaveFormObservables() {
    if (this.formSaveAllObservables$.length === 0) {
      if (this.itemEditFormComponentQueryList?.length > 0) {
        this.itemEditFormComponentQueryList.forEach(itemEditFormComponent => {
          this.formSaveAllObservables$.push(itemEditFormComponent.formSaveObservable());
        });
      }

      // only called once when a formSaveAllObservables array is filled
      if (this.formSaveAllObservables$.length > 0) {
        this.saveFormSubscribe();
        this.checkFormsState();
      }
    }
  }

  /** With zip function look all forms submit observables and when all finish save all data (call savemany service) */
  private saveFormSubscribe() {
    // important - only subscribe once
    this.subscriptions.push(zip(...this.formSaveAllObservables$)
      .pipe(switchMap((actions: fromItems.SaveItemAttributesValuesAction[]) => {
        angularConsoleLog('ZIP ACTIONS ITEM: ', JsonItem1.create(actions[0].item));
        const allItems: JsonItem1[] = [];
        actions.forEach(action => {
          const item = JsonItem1.create(action.item);
          // do not try to save item which doesn't have any fields, nothing could have changed about it
          if (Object.keys(item.Entity.Attributes).length > 0) { allItems.push(item); }
        });
        const body = {
          Items: allItems,
          IsPublished: this.publishMode === 'show',
          DraftShouldBranch: this.publishMode === 'branch'
        };
        return this.eavService.savemany(this.eavConfig.appId, this.eavConfig.partOfPage, JSON.stringify(body))
          .pipe(map(data => {
            this.enableDraft = true; // after saving, we can re-save as draft
            this.eavService.saveItemSuccess(data);
          }), tap(data => angularConsoleLog('working')));
      }), catchError(err => of(this.eavService.saveItemError(err))))
      .subscribe());
  }

  /**
   * Display form messages on form success or form error.
   * Imortant: this is subscribed to an all open dialogs, a forms are distinguished by this.formIsSaved variable.
   * TODO: need to distinguished form by forms data
   */
  private saveFormMessagesSubscribe() {
    this.subscriptions.push(this.actions$
      .pipe(ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_SUCCESS))
      .subscribe((action: fromItems.SaveItemAttributesValuesSuccessAction) => {
        this.itemService.updateItemId(action.data);
        angularConsoleLog('success END: ', action.data);
        this.snackBarOpen(this.translate.instant('Message.Saved'));
        this.dialogRef.disableClose = false;
        if (this.formIsSaved) {
          this.closeDialog(action.data);
        }
      }));
    this.subscriptions.push(this.actions$
      .pipe(ofType(fromItems.SAVE_ITEM_ATTRIBUTES_VALUES_ERROR))
      .subscribe((action: fromItems.SaveItemAttributesValuesErrorAction) => {
        angularConsoleLog('error END', action.error);
        // TODO show error message
        this.snackBarOpen('error');
      }));
  }

  /** First set form state, then read state in get method */
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
      this.itemEditFormComponentQueryList.forEach(itemEditFormComponent => {
        // set form valid
        if (itemEditFormComponent.form.valid === false
          && (!itemEditFormComponent.item.header.Group || itemEditFormComponent.item.header.Group.SlotCanBeEmpty === false)) {
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
      this.publishMode = Object.keys(this.eavConfig.versioningOptions)[0] as 'branch' | 'show' | 'hide';
    }
  }

  /** Open snackbar with message and after closed call function close */
  private snackBarOpen(message: string, duration: number = 3000) {
    const snackBarRef = this.snackBar.open(message, '', {
      duration,
    });
  }

  /** Open snackbar when snack bar not saved */
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
    setTimeout(() => { this.extendedSaveButtonIsReduced = true; }, 5000);
  }

  private loadDebugEnabled() {
    // set initial debug enabled value
    const debugEnabled$ = this.globalConfigurationService.getDebugEnabled();
    debugEnabled$.pipe(take(1)).subscribe(debugEnabled => { this.debugEnabled = debugEnabled; });

    // subscribe to debug enabled changes
    this.subscriptions.push(
      debugEnabled$.subscribe(debugEnabled => {
        if (this.debugEnabled === debugEnabled) { return; }
        this.debugEnabled = debugEnabled;
        if (!this.debugEnabled) { this.debugInfoIsOpen = false; }
      })
    );
  }

  private hideHeaderSubscribe() {
    this.subscriptions.push(
      this.languageInstanceService.getHideHeader(this.formId).subscribe(hideHeader => {
        this.hideHeader = hideHeader;
      }),
    );
  }
}
