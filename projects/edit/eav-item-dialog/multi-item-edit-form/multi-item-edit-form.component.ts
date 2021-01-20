import { AfterViewChecked, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { delay, filter, map, startWith, tap } from 'rxjs/operators';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { SnackBarSaveErrorsComponent } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { SaveErrorsSnackData } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackData } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { EditEntryComponent } from '../../edit-entry/edit-entry.component';
import { FieldErrorMessage } from '../../shared/models';
import { Item } from '../../shared/models/eav';
import { JsonItem1 } from '../../shared/models/json-format-v1';
import { EavService } from '../../shared/services/eav.service';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { GlobalConfigService } from '../../shared/services/global-configuration.service';
import { LoadIconsService } from '../../shared/services/load-icons.service';
import { ContentTypeItemService } from '../../shared/store/ngrx-data/content-type-item.service';
import { ContentTypeService } from '../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../shared/store/ngrx-data/input-type.service';
import { ItemService } from '../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../shared/store/ngrx-data/language-instance.service';
import { LanguageService } from '../../shared/store/ngrx-data/language.service';
import { PrefetchService } from '../../shared/store/ngrx-data/prefetch.service';
import { PublishStatusService } from '../../shared/store/ngrx-data/publish-status.service';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';
import { MultiEditFormTemplateVars, SaveEavFormData } from './multi-item-edit-form.models';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.scss'],
  providers: [EditRoutingService],
})
export class MultiItemEditFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChildren(ItemEditFormComponent) private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  templateVars$: Observable<MultiEditFormTemplateVars>;

  private formsAreValid$: BehaviorSubject<boolean>;
  private allControlsAreDisabled$: BehaviorSubject<boolean>;
  private reduceSaveButton$: BehaviorSubject<boolean>;
  private debugInfoIsOpen$: BehaviorSubject<boolean>;
  private formErrors: { [key: string]: string }[];
  private formsAreDirty: { [key: string]: boolean };
  private initialFormsStateChecked: boolean;
  private formIsSaved: boolean;
  private subscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private globalConfigService: GlobalConfigService,
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
    private editRoutingService: EditRoutingService,
    private publishStatusService: PublishStatusService,
    private formPrefetchService: PrefetchService,
  ) { }

  ngOnInit() {
    this.formsAreValid$ = new BehaviorSubject(false);
    this.allControlsAreDisabled$ = new BehaviorSubject(true);
    this.reduceSaveButton$ = new BehaviorSubject(false);
    this.debugInfoIsOpen$ = new BehaviorSubject(false);
    this.formErrors = [];
    this.formsAreDirty = {};
    this.initialFormsStateChecked = false;
    this.formIsSaved = false;
    this.subscription = new Subscription();
    this.editRoutingService.init();
    this.loadIconsService.load();
    // spm TODO: added a small delay to calculate fields a bit later than languages to make form opening feel smoother.
    // Remove if calculating fields gets faster
    const items$ = this.itemService.selectItems(this.eavService.eavConfig.itemGuids).pipe(delay(0));
    const hideHeader$ = this.languageInstanceService.getHideHeader(this.eavService.eavConfig.formId);
    const debugEnabled$ = this.globalConfigService.getDebugEnabled().pipe(
      tap(debugEnabled => {
        if (this.debugInfoIsOpen$.value && !debugEnabled) {
          this.debugInfoIsOpen$.next(false);
        }
      })
    );
    this.templateVars$ = combineLatest([
      combineLatest([items$.pipe(startWith([])), this.formsAreValid$, this.allControlsAreDisabled$, this.reduceSaveButton$]),
      combineLatest([debugEnabled$, this.debugInfoIsOpen$, hideHeader$]),
    ]).pipe(
      map(([
        [items, formsAreValid, allControlsAreDisabled, reduceSaveButton],
        [debugEnabled, debugInfoIsOpen, hideHeader],
      ]) => {
        const templateVars: MultiEditFormTemplateVars = {
          items,
          formsAreValid,
          allControlsAreDisabled,
          reduceSaveButton,
          debugEnabled,
          debugInfoIsOpen,
          hideHeader,
        };
        return templateVars;
      }),
    );
    this.languageChangeSubscribe();
    this.dialogBackdropClickSubscribe();
    this.formSetValueChangeSubscribe();
    setTimeout(() => { this.reduceSaveButton$.next(true); }, 5000);
  }

  ngAfterViewChecked() {
    if (!this.initialFormsStateChecked) {
      this.checkFormsState();
    }
  }

  ngOnDestroy() {
    this.reduceSaveButton$.complete();
    this.debugInfoIsOpen$.complete();
    this.formsAreValid$.complete();
    this.allControlsAreDisabled$.complete();
    this.subscription.unsubscribe();
    this.languageInstanceService.removeLanguageInstance(this.eavService.eavConfig.formId);
    this.publishStatusService.removePublishStatus(this.eavService.eavConfig.formId);

    if (this.eavService.eavConfig.isParentDialog) {
      // clear the rest of the store
      this.languageInstanceService.clearCache();
      this.languageService.clearCache();
      this.itemService.clearCache();
      this.inputTypeService.clearCache();
      this.featureService.clearCache();
      this.contentTypeItemService.clearCache();
      this.contentTypeService.clearCache();
      this.publishStatusService.clearCache();
      this.formPrefetchService.clearCache();
    }
  }

  /** Close form dialog or if close is disabled show a message */
  closeDialog(saveResult?: any) {
    if (this.dialogRef.disableClose) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close(this.eavService.eavConfig.createMode ? saveResult : undefined);
    }
  }

  trackByFn(index: number, item: Item) {
    return item.Entity.Id === 0 ? item.Entity.Guid : item.Entity.Id;
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
        const items = this.itemEditFormRefs
          .map(itemEditFormComponent => {
            const isValid = itemEditFormComponent.form.form.valid
              || itemEditFormComponent.checkAreAllControlsDisabled()
              || (itemEditFormComponent.item.Header.Group && itemEditFormComponent.item.Header.Group.SlotCanBeEmpty);
            return isValid ? itemEditFormComponent.item : null;
          })
          .filter(item => item != null)
          .map(item => JsonItem1.create(item))
          // do not try to save item which doesn't have any fields, nothing could have changed about it
          .filter(item => Object.keys(item.Entity.Attributes).length > 0);
        const publishStatus = this.publishStatusService.getPublishStatus(this.eavService.eavConfig.formId);

        const saveFormData: SaveEavFormData = {
          Items: items,
          IsPublished: publishStatus.IsPublished,
          DraftShouldBranch: publishStatus.DraftShouldBranch,
        };
        angularConsoleLog('SAVE FORM DATA: ', saveFormData);
        this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

        this.eavService.saveFormData(saveFormData).subscribe({
          next: result => {
            angularConsoleLog('saveAll', close);
            if (close) { this.formIsSaved = true; }

            this.itemService.updateItemId(result);
            angularConsoleLog('success END: ', result);
            this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
            this.dialogRef.disableClose = false;
            if (this.formIsSaved) {
              this.closeDialog(result);
            }
          },
          error: err => {
            angularConsoleLog('error END', err);
            this.snackBar.open('Error', null, { duration: 2000 });
          },
        });
      } else {
        this.calculateAllValidationMessages();
        const fieldErrors: FieldErrorMessage[] = [];
        this.formErrors.forEach(formError => {
          Object.keys(formError).forEach(key => {
            fieldErrors.push({ field: key, message: formError[key] });
          });
        });
        const snackData: SaveErrorsSnackData = {
          fieldErrors,
        };
        this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
          data: snackData,
          duration: 5000,
        });
      }
    }, 100);
  }

  debugInfoOpened(opened: boolean) {
    this.debugInfoIsOpen$.next(opened);
  }

  private languageChangeSubscribe() {
    this.subscription.add(
      this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId).subscribe(language => {
        this.formErrors = []; // on current language change reset form errors
      })
    );
  }

  private dialogBackdropClickSubscribe() {
    this.subscription.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
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

  private formSetValueChangeSubscribe() {
    this.subscription.add(
      this.eavService.formValueChange$.pipe(
        filter(formSet => formSet.formId === this.eavService.eavConfig.formId)
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
          && (!itemEditFormComponent.item.Header.Group || itemEditFormComponent.item.Header.Group.SlotCanBeEmpty === false)
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

      if (!this.initialFormsStateChecked) {
        this.initialFormsStateChecked = true;
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

  /** Open snackbar when snack bar not saved */
  private snackBarYouHaveUnsavedChanges() {
    const snackData: UnsavedChangesSnackData = {
      save: false,
    };
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data: snackData,
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
