import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, Subscription } from 'rxjs';
import { delay, map, startWith, tap } from 'rxjs/operators';
import { consoleLogAngular } from '../../../ng-dialogs/src/app/shared/helpers/console-log-angular.helper';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { SnackBarSaveErrorsComponent } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.component';
import { SaveErrorsSnackData } from '../../eav-material-controls/dialogs/snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackData } from '../../eav-material-controls/dialogs/snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';
import { ValidationMessagesService } from '../../eav-material-controls/validators/validation-messages-service';
import { EditEntryComponent } from '../../edit-entry/edit-entry.component';
import { FieldErrorMessage, SaveResult } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { Item1 } from '../../shared/models/json-format-v1';
import { EavService, EditRoutingService, FormsStateService, FormulaDesignerService, LoadIconsService } from '../../shared/services';
// tslint:disable-next-line:max-line-length
import { AdamCacheService, ContentTypeItemService, ContentTypeService, EntityCacheService, FeatureService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, LinkCacheService, PublishStatusService, StringQueryCacheService } from '../../shared/store/ngrx-data';
import { ItemEditFormComponent } from '../item-edit-form/item-edit-form.component';
import { MultiEditFormTemplateVars, SaveEavFormData } from './multi-item-edit-form.models';

@Component({
  selector: 'app-multi-item-edit-form',
  templateUrl: './multi-item-edit-form.component.html',
  styleUrls: ['./multi-item-edit-form.component.scss'],
  providers: [EditRoutingService, FormsStateService, FormulaDesignerService],
})
export class MultiItemEditFormComponent implements OnInit, OnDestroy {
  @ViewChildren(ItemEditFormComponent) itemEditFormRefs: QueryList<ItemEditFormComponent>;

  templateVars$: Observable<MultiEditFormTemplateVars>;

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
    private formsStateService: FormsStateService,
    private entityCacheService: EntityCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.debugInfoIsOpen$ = new BehaviorSubject(false);
    this.subscription = new Subscription();
    this.editRoutingService.init();
    this.loadIconsService.load();
    this.formsStateService.init();
    this.formulaDesignerService.init();
    /** Small delay to make form opening feel smoother. */
    const delayForm$ = of(false).pipe(delay(0), startWith(true));
    const reduceSaveButton$ = of(true).pipe(delay(5000), startWith(false));
    const items$ = this.itemService.getItems$(this.eavService.eavConfig.itemGuids);
    const hideHeader$ = this.languageInstanceService.getHideHeader$(this.eavService.eavConfig.formId);
    const formsValid$ = this.formsStateService.formsValid$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$().pipe(
      tap(debugEnabled => {
        if (this.debugInfoIsOpen$.value && !debugEnabled) {
          this.debugInfoIsOpen$.next(false);
        }
      })
    );
    this.templateVars$ = combineLatest([
      combineLatest([items$, formsValid$, delayForm$, reduceSaveButton$]),
      combineLatest([debugEnabled$, this.debugInfoIsOpen$, hideHeader$]),
    ]).pipe(
      map(([
        [items, formsValid, delayForm, reduceSaveButton],
        [debugEnabled, debugInfoIsOpen, hideHeader],
      ]) => {
        const templateVars: MultiEditFormTemplateVars = {
          items,
          formsValid,
          delayForm,
          reduceSaveButton,
          debugEnabled,
          debugInfoIsOpen,
          hideHeader,
        };
        return templateVars;
      }),
    );
    this.dialogBackdropClickSubscribe();
  }

  ngOnDestroy() {
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
      this.entityCacheService.clearCache();
      this.adamCacheService.clearCache();
      this.linkCacheService.clearCache();
      this.stringQueryCacheService.clearCache();
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
    if (this.formsStateService.formsValid$.value) {
      const items = this.itemEditFormRefs
        .map(itemEditFormRef => {
          const eavItem = this.itemService.getItem(itemEditFormRef.entityGuid);
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
      consoleLogAngular('SAVE FORM DATA:', saveFormData);
      this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

      this.eavService.saveFormData(saveFormData).subscribe({
        next: result => {
          consoleLogAngular('SAVED!, result:', result, 'close:', close);
          this.itemService.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsDirty$.next(false);
          this.saveResult = result;
          if (close) {
            this.closeDialog();
          }
        },
        error: err => {
          consoleLogAngular('SAVE FAILED:', err);
          this.snackBar.open('Error', null, { duration: 2000 });
        },
      });
    } else {
      if (this.itemEditFormRefs == null) { return; }

      const formErrors: Dictionary<string>[] = [];
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
