import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, fromEvent, Observable, Subscription } from 'rxjs';
import { delay, map, startWith, tap } from 'rxjs/operators';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { SnackBarSaveErrorsComponent } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { SaveErrorsSnackData } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackData } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { EditEntryComponent } from '../../edit-entry/edit-entry.component';
import { FieldErrorMessage, ObjectModel, SaveResult } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { Item1 } from '../../shared/models/json-format-v1';
import { EavService } from '../../shared/services/eav.service';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { FormsStateService } from '../../shared/services/forms-state.service';
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
  providers: [EditRoutingService, FormsStateService],
})
export class MultiItemEditFormComponent implements OnInit, OnDestroy {
  @ViewChildren(ItemEditFormComponent) private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  templateVars$: Observable<MultiEditFormTemplateVars>;

  private reduceSaveButton$: BehaviorSubject<boolean>;
  private debugInfoIsOpen$: BehaviorSubject<boolean>;
  private subscription: Subscription;
  private saveResult: SaveResult;

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
    private formsStateService: FormsStateService,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.reduceSaveButton$ = new BehaviorSubject(false);
    this.debugInfoIsOpen$ = new BehaviorSubject(false);
    this.subscription = new Subscription();
    this.editRoutingService.init();
    this.loadIconsService.load();
    this.formsStateService.init();
    // spm TODO: added a small delay to calculate fields a bit later than languages to make form opening feel smoother.
    // Remove if calculating fields gets faster
    const items$ = this.itemService.selectItems(this.eavService.eavConfig.itemGuids).pipe(delay(0));
    const hideHeader$ = this.languageInstanceService.getHideHeader$(this.eavService.eavConfig.formId);
    const formsValid$ = this.formsStateService.formsValid$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled().pipe(
      tap(debugEnabled => {
        if (this.debugInfoIsOpen$.value && !debugEnabled) {
          this.debugInfoIsOpen$.next(false);
        }
      })
    );
    this.templateVars$ = combineLatest([
      combineLatest([items$.pipe(startWith([])), formsValid$, this.reduceSaveButton$]),
      combineLatest([debugEnabled$, this.debugInfoIsOpen$, hideHeader$]),
    ]).pipe(
      map(([
        [items, formsValid, reduceSaveButton],
        [debugEnabled, debugInfoIsOpen, hideHeader],
      ]) => {
        const templateVars: MultiEditFormTemplateVars = {
          items,
          formsValid,
          reduceSaveButton,
          debugEnabled,
          debugInfoIsOpen,
          hideHeader,
        };
        return templateVars;
      }),
    );
    this.dialogBackdropClickSubscribe();
    setTimeout(() => { this.reduceSaveButton$.next(true); }, 5000);
  }

  ngOnDestroy() {
    this.reduceSaveButton$.complete();
    this.debugInfoIsOpen$.complete();
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

  closeDialog(forceClose?: boolean) {
    if (forceClose) {
      this.dialogRef.close(this.eavService.eavConfig.createMode ? this.saveResult : undefined);
    } else if (this.formsStateService.formsDirty$.value) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close(this.eavService.eavConfig.createMode ? this.saveResult : undefined);
    }
  }

  trackByFn(index: number, item: EavItem) {
    return item.Entity.Guid;
  }

  /** Save all forms */
  saveAll(close: boolean) {
    this.eavService.forceConnectorSave$.next();
    // start gathering submit data with a timeout to let custom components which run outside Angular zone to save their values
    setTimeout(() => {
      if (this.formsStateService.formsValid$.value) {
        const items = this.itemEditFormRefs
          .map(itemEditFormRef => {
            const eavItem = itemEditFormRef.item;
            const isValid = this.formsStateService.getFormValid(eavItem.Entity.Guid);
            if (!isValid) { return; }

            // do not try to save item which doesn't have any fields, nothing could have changed about it
            const hasAttributes = Object.keys(eavItem.Entity.Attributes).length > 0;
            if (!hasAttributes) { return; }

            const item = Item1.convert(eavItem);
            return item;
          })
          .filter(item => item != null);
        const publishStatus = this.publishStatusService.getPublishStatus(this.eavService.eavConfig.formId);

        const saveFormData: SaveEavFormData = {
          Items: items,
          IsPublished: publishStatus.IsPublished,
          DraftShouldBranch: publishStatus.DraftShouldBranch,
        };
        angularConsoleLog('SAVE FORM DATA:', saveFormData);
        this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

        this.eavService.saveFormData(saveFormData).subscribe({
          next: result => {
            angularConsoleLog('SAVED!, result:', result, 'close:', close);
            this.itemService.updateItemId(result);
            this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
            this.formsStateService.formsDirty$.next(false);
            this.saveResult = result;
            if (close) {
              this.closeDialog();
            }
          },
          error: err => {
            angularConsoleLog('SAVE FAILED:', err);
            this.snackBar.open('Error', null, { duration: 2000 });
          },
        });
      } else {
        if (this.itemEditFormRefs == null) { return; }

        const formErrors: ObjectModel<string>[] = [];
        this.itemEditFormRefs.forEach(itemEditFormRef => {
          if (!itemEditFormRef.eavFormRef.form.invalid) { return; }
          formErrors.push(this.validationMessagesService.validateForm(itemEditFormRef.eavFormRef.form));
        });

        const fieldErrors: FieldErrorMessage[] = [];
        formErrors.forEach(formError => {
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

  private dialogBackdropClickSubscribe() {
    this.subscription.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
        if (!this.formsStateService.formsDirty$.value) { return; }
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
        this.closeDialog(true);
      }
    });
  }
}
