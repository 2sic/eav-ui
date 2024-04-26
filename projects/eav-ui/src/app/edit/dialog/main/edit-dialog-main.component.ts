import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, delay, fromEvent, map, Observable, of, startWith, Subscription, tap } from 'rxjs';
import { BaseSubsinkComponent } from '../../../shared/components/base-subsink-component/base-subsink.component';
import { consoleLogDev } from '../../../shared/helpers/console-log-angular.helper';
import { FormBuilderComponent } from '../../form/builder/form-builder/form-builder.component';
import { FormulaDesignerService } from '../../formulas/formula-designer.service';
import { MetadataDecorators } from '../../shared/constants';
import { InputFieldHelpers, ValidationMessagesHelpers } from '../../shared/helpers';
import { FieldErrorMessage, SaveResult } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { EavEntityBundleDto } from '../../shared/models/json-format-v1';
import { EavService, EditRoutingService, FormsStateService, LoadIconsService } from '../../shared/services';
// tslint:disable-next-line:max-line-length
import { AdamCacheService, ContentTypeItemService, ContentTypeService, PickerDataCacheService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, LinkCacheService, PublishStatusService, StringQueryCacheService } from '../../shared/store/ngrx-data';
import { EditEntryComponent } from '../entry/edit-entry.component';
import { EditDialogMainViewModel, SaveEavFormData } from './edit-dialog-main.models';
import { SnackBarSaveErrorsComponent } from './snack-bar-save-errors/snack-bar-save-errors.component';
import { SaveErrorsSnackBarData } from './snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';

@Component({
  selector: 'app-edit-dialog-main',
  templateUrl: './edit-dialog-main.component.html',
  styleUrls: ['./edit-dialog-main.component.scss'],
  providers: [EditRoutingService, FormsStateService, FormulaDesignerService],
})
export class EditDialogMainComponent extends BaseSubsinkComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(FormBuilderComponent) formBuilderRefs: QueryList<FormBuilderComponent>;

  viewModel$: Observable<EditDialogMainViewModel>;

  private viewInitiated$: BehaviorSubject<boolean>;
  private debugInfoIsOpen$: BehaviorSubject<boolean>;
  private saveResult: SaveResult;

  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private globalConfigService: GlobalConfigService,
    private eavService: EavService,
    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageInstanceService: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private loadIconsService: LoadIconsService,
    private editRoutingService: EditRoutingService,
    private publishStatusService: PublishStatusService,
    private formsStateService: FormsStateService,
    private entityCacheService: PickerDataCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    super();
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.viewInitiated$ = new BehaviorSubject(false);
    this.debugInfoIsOpen$ = new BehaviorSubject(false);
    this.editRoutingService.init();
    this.loadIconsService.load();
    this.formsStateService.init();
    this.formulaDesignerService.init();
    /** Small delay to make form opening feel smoother. */
    const delayForm$ = of(false).pipe(delay(0), startWith(true));
    const items$ = this.itemService.getItems$(this.eavService.eavConfig.itemGuids);
    const hideHeader$ = this.languageInstanceService.getHideHeader$(this.eavService.eavConfig.formId);
    const formsValid$ = this.formsStateService.formsValid$;
    const saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$;
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$().pipe(
      tap(debugEnabled => {
        if (this.debugInfoIsOpen$.value && !debugEnabled) {
          this.debugInfoIsOpen$.next(false);
        }
      })
    );
    this.viewModel$ = combineLatest([
      combineLatest([items$, formsValid$, delayForm$, this.viewInitiated$]),
      combineLatest([debugEnabled$, this.debugInfoIsOpen$, hideHeader$, saveButtonDisabled$]),
    ]).pipe(
      map(([
        [items, formsValid, delayForm, viewInitiated],
        [debugEnabled, debugInfoIsOpen, hideHeader, saveButtonDisabled],
      ]) => {
        const viewModel: EditDialogMainViewModel = {
          items,
          formsValid,
          delayForm,
          viewInitiated,
          debugEnabled,
          debugInfoIsOpen,
          hideHeader,
          saveButtonDisabled,
        };
        return viewModel;
      }),
    );
    this.startSubscriptions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.viewInitiated$.next(true);
    });
  }

  ngOnDestroy() {
    this.viewInitiated$.complete();
    this.debugInfoIsOpen$.complete();
    this.languageInstanceService.removeLanguageInstance(this.eavService.eavConfig.formId);
    this.publishStatusService.removePublishStatus(this.eavService.eavConfig.formId);

    if (this.eavService.eavConfig.isParentDialog) {
      // clear the rest of the store
      this.languageInstanceService.clearCache();
      this.languageService.clearCache();
      this.itemService.clearCache();
      this.inputTypeService.clearCache();
      this.contentTypeItemService.clearCache();
      this.contentTypeService.clearCache();
      this.publishStatusService.clearCache();
      this.entityCacheService.clearCache();
      this.adamCacheService.clearCache();
      this.linkCacheService.clearCache();
      this.stringQueryCacheService.clearCache();
    }
    super.ngOnDestroy();
  }

  closeDialog(forceClose?: boolean) {
    if (forceClose) {
      this.dialogRef.close(this.eavService.eavConfig.createMode ? this.saveResult : undefined);
    } else if (!this.formsStateService.readOnly$.value.isReadOnly && this.formsStateService.formsDirty$.value) {
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
      const items = this.formBuilderRefs
        .map(formBuilderRef => {
          const eavItem = this.itemService.getItem(formBuilderRef.entityGuid);
          const isValid = this.formsStateService.getFormValid(eavItem.Entity.Guid);
          if (!isValid) { return; }

          // do not try to save item which doesn't have any fields, nothing could have changed about it
          // but enable saving if there is a special metadata
          const hasAttributes = Object.keys(eavItem.Entity.Attributes).length > 0;
          const contentTypeId = InputFieldHelpers.getContentTypeId(eavItem);
          const contentType = this.contentTypeService.getContentType(contentTypeId);
          const saveIfEmpty = contentType.Metadata.some(m => m.Type.Name === MetadataDecorators.SaveEmptyDecorator);
          if (!hasAttributes && !saveIfEmpty) { return; }

          const item = EavEntityBundleDto.bundleToDto(eavItem);
          return item;
        })
        .filter(item => item != null);
      const publishStatus = this.publishStatusService.getPublishStatus(this.eavService.eavConfig.formId);

      const saveFormData: SaveEavFormData = {
        Items: items,
        IsPublished: publishStatus.IsPublished,
        DraftShouldBranch: publishStatus.DraftShouldBranch,
      };
      consoleLogDev('SAVE FORM DATA:', saveFormData);
      this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

      this.eavService.saveFormData(saveFormData, this.eavService.eavConfig.partOfPage).subscribe({
        next: result => {
          consoleLogDev('SAVED!, result:', result, 'close:', close);
          this.itemService.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsDirty$.next(false);
          this.saveResult = result;
          if (close) {
            this.closeDialog();
          }
        },
        error: err => {
          consoleLogDev('SAVE FAILED:', err);
          this.snackBar.open('Error', null, { duration: 2000 });
        },
      });
    } else {
      if (this.formBuilderRefs == null) { return; }

      const formErrors: Record<string, string>[] = [];
      this.formBuilderRefs.forEach(formBuilderRef => {
        if (!formBuilderRef.form.invalid) { return; }
        formErrors.push(ValidationMessagesHelpers.validateForm(formBuilderRef.form));
      });

      const fieldErrors: FieldErrorMessage[] = [];
      formErrors.forEach(formError => {
        Object.keys(formError).forEach(key => {
          fieldErrors.push({ field: key, message: formError[key] });
        });
      });
      const snackBarData: SaveErrorsSnackBarData = {
        fieldErrors,
      };
      this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
        data: snackBarData,
        duration: 5000,
      });
    }
  }

  debugInfoOpened(opened: boolean) {
    this.debugInfoIsOpen$.next(opened);
  }

  private startSubscriptions() {
    this.subscription.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
        if (this.formsStateService.readOnly$.value.isReadOnly || !this.formsStateService.formsDirty$.value) { return; }
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.snackBarYouHaveUnsavedChanges();
      })
    );

    this.subscription.add(
      this.formsStateService.saveForm$.subscribe(close => this.saveAll(close)),
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
        if (!this.formsStateService.readOnly$.value.isReadOnly) {
          this.saveAll(false);
        }
        return;
      }
    });
  }

  private snackBarYouHaveUnsavedChanges() {
    const snackBarData: UnsavedChangesSnackBarData = {
      save: false,
    };
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data: snackBarData,
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if ((snackBarRef.containerInstance.snackBarConfig.data as UnsavedChangesSnackBarData).save) {
        this.saveAll(true);
      } else {
        this.closeDialog(true);
      }
    });
  }
}
