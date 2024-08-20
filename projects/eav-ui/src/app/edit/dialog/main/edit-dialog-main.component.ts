import { AfterViewInit, Component, computed, inject, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, delay, fromEvent, map, Observable, of, startWith } from 'rxjs';
import { BaseComponent } from '../../../shared/components/base.component';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder.component';
import { FormulaDesignerService } from '../../formulas/formula-designer.service';
import { MetadataDecorators } from '../../shared/constants';
import { InputFieldHelpers } from '../../shared/helpers';
import { FieldErrorMessage, SaveResult } from '../../shared/models';
import { EavItem } from '../../shared/models/eav';
import { EavEntityBundleDto } from '../../shared/models/json-format-v1';
import { FormConfigService, EditRoutingService, FormsStateService, LoadIconsService } from '../../shared/services';
// tslint:disable-next-line:max-line-length
import { AdamCacheService, ContentTypeItemService, ContentTypeService, GlobalConfigService, InputTypeService, ItemService, LanguageInstanceService, LanguageService, LinkCacheService, PublishStatusService } from '../../shared/store/ngrx-data';
import { EditEntryComponent } from '../entry/edit-entry.component';
import { EditDialogMainViewModel, SaveEavFormData } from './edit-dialog-main.models';
import { SnackBarSaveErrorsComponent } from './snack-bar-save-errors/snack-bar-save-errors.component';
import { SaveErrorsSnackBarData } from './snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';
import { EditDialogFooterComponent } from '../footer/edit-dialog-footer.component';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { FormSlideDirective } from './form-slide.directive';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { EditDialogHeaderComponent } from '../header/edit-dialog-header.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { FormDataService } from '../../shared/services/form-data.service';
import { ToggleDebugDirective } from '../../../shared/directives/toggle-debug.directive';
import { SourceService } from '../../../code-editor/services/source.service';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { ExtendedFabSpeedDialImports } from '../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { transient } from '../../../core';
import { PickerDataCacheService } from '../../fields/picker/cache/picker-data-cache.service';
import { PickerTreeDataHelper } from '../../fields/picker/picker-tree/picker-tree-data-helper';
import { ValidationMessagesHelpers } from '../../shared/validation/validation-messages.helpers';

const logThis = false;
const nameOfThis = 'EditDialogMainComponent';

@Component({
  selector: 'app-edit-dialog-main',
  templateUrl: './edit-dialog-main.component.html',
  styleUrls: ['./edit-dialog-main.component.scss'],
  standalone: true,
  imports: [
    MatDialogActions,
    NgClass,
    ExtendedModule,
    EditDialogHeaderComponent,
    CdkScrollable,
    FormSlideDirective,
    EntityFormBuilderComponent,
    MatRippleModule,
    MatIconModule,
    EditDialogFooterComponent,
    AsyncPipe,
    TranslateModule,
    ...ExtendedFabSpeedDialImports,
    ToggleDebugDirective,
  ],
  providers: [
    EditRoutingService,
    FormsStateService,
    FormulaDesignerService,
    // 2dm: don't think it's used for real - except for in the create template, where it's referenced directly
    SourceService,

    // TODO: probably move to each picker component (Errors)
    PickerTreeDataHelper,
  ],
})
export class EditDialogMainComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren(EntityFormBuilderComponent) formBuilderRefs: QueryList<EntityFormBuilderComponent>;

  viewModel$: Observable<EditDialogMainViewModel>;

  private viewInitiated$ = new BehaviorSubject(false);
  private saveResult: SaveResult;

  private globalConfigService = inject(GlobalConfigService);
  private formConfig = inject(FormConfigService);
  
  private loadIconsService = transient(LoadIconsService);

  /** Signal to determine if we should show the footer */
  protected showFooter = computed(() => {
    // if debug is true, then it was set once using the magic shortcut
    if (this.globalConfigService.isDebug()) {
      this.#debugWasModified = true;
      return true;
    }
    
    // If debug is false, and was never modified, show based on system admin status
    return (!this.#debugWasModified && this.formConfig.config.dialogContext.User?.IsSystemAdmin);
  });

  /** Special variable to check if debug was ever triggered, to allow super-users to hide the footer */
  #debugWasModified = false;

  /** Signal to tell the UI that the footer needs more space (changes CSS) */
  expandDebugFooter = signal(false);

  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,

    private formDataService: FormDataService,

    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private publishStatusService: PublishStatusService,
    private formsStateService: FormsStateService,
    private entityCacheService: PickerDataCacheService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
    this.dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.editRoutingService.init();
    this.loadIconsService.load();
    this.formsStateService.init();
    this.formulaDesignerService.init();
    /** Small delay to make form opening feel smoother. */
    const delayForm$ = of(false).pipe(delay(0), startWith(true));
    const items$ = this.itemService.getItems$(this.formConfig.config.itemGuids);
    const hideHeader$ = this.languageStore.getHideHeader$(this.formConfig.config.formId);
    const formsValid$ = this.formsStateService.formsValid$;
    const saveButtonDisabled$ = this.formsStateService.saveButtonDisabled$;
    
    this.viewModel$ = combineLatest([
      combineLatest([items$, formsValid$, delayForm$, this.viewInitiated$]),
      combineLatest([hideHeader$, saveButtonDisabled$]),
    ]).pipe(
      map(([
        [items, formsValid, delayForm, viewInitiated],
        [hideHeader, saveButtonDisabled],
      ]) => {
        const viewModel: EditDialogMainViewModel = {
          items,
          formsValid,
          delayForm,
          viewInitiated,
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
    this.languageStore.removeFromStore(this.formConfig.config.formId);
    this.publishStatusService.removePublishStatus(this.formConfig.config.formId);

    if (this.formConfig.config.isParentDialog) {
      // clear the rest of the store
      this.languageStore.clearCache();
      this.languageService.clearCache();
      this.itemService.clearCache();
      this.inputTypeService.clearCache();
      this.contentTypeItemService.clearCache();
      this.contentTypeService.clearCache();
      this.publishStatusService.clearCache();
      this.entityCacheService.clearCache();
      this.adamCacheService.clearCache();
      this.linkCacheService.clearCache();
    }
    super.ngOnDestroy();
  }

  closeDialog(forceClose?: boolean) {
    if (forceClose) {
      this.dialogRef.close(this.formConfig.config.createMode ? this.saveResult : undefined);
    } else if (!this.formsStateService.readOnly().isReadOnly && this.formsStateService.formsDirty$.value) {
      this.snackBarYouHaveUnsavedChanges();
    } else {
      this.dialogRef.close(this.formConfig.config.createMode ? this.saveResult : undefined);
    }
  }

  trackByFn(index: number, item: EavItem) {
    return item.Entity.Guid;
  }

  /** Save all forms */
  saveAll(close: boolean) {
    const l = this.log.fn('saveAll', { close });
    if (this.formsStateService.formsValid$.value) {
      const items = this.formBuilderRefs
        .map(formBuilderRef => {
          const eavItem = this.itemService.getItem(formBuilderRef.entityGuid);
          const isValid = this.formsStateService.getFormValid(eavItem.Entity.Guid);
          if (!isValid)
            return;

          // do not try to save item which doesn't have any fields, nothing could have changed about it
          // but enable saving if there is a special metadata
          const hasAttributes = Object.keys(eavItem.Entity.Attributes).length > 0;
          const contentTypeId = InputFieldHelpers.getContentTypeNameId(eavItem);
          const contentType = this.contentTypeService.getContentType(contentTypeId);
          const saveIfEmpty = contentType.Metadata.some(m => m.Type.Name === MetadataDecorators.SaveEmptyDecorator);
          if (!hasAttributes && !saveIfEmpty)
            return;

          const item = EavEntityBundleDto.bundleToDto(eavItem);
          return item;
        })
        .filter(item => item != null);
      const publishStatus = this.publishStatusService.getPublishStatus(this.formConfig.config.formId);

      const saveFormData: SaveEavFormData = {
        Items: items,
        IsPublished: publishStatus.IsPublished,
        DraftShouldBranch: publishStatus.DraftShouldBranch,
      };
      l.a('SAVE FORM DATA:', { saveFormData });
      this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

      this.formDataService.saveFormData(saveFormData, this.formConfig.config.partOfPage).subscribe({
        next: result => {
          l.a('SAVED!, result:', { result, close });
          this.itemService.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsDirty$.next(false);
          this.saveResult = result;
          if (close) {
            this.closeDialog();
          }
        },
        error: err => {
          l.a('SAVE FAILED:', err);
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
    this.log.fn('debugInfoOpened', { opened });
    this.expandDebugFooter.set(opened);
  }

  private startSubscriptions() {
    this.subscriptions.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
        if (this.formsStateService.readOnly().isReadOnly || !this.formsStateService.formsDirty$.value) { return; }
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.snackBarYouHaveUnsavedChanges();
      })
    );

    this.subscriptions.add(
      this.formsStateService.saveForm$.subscribe(close => this.saveAll(close))
    );

    this.subscriptions.add(
      this.dialogRef.backdropClick().subscribe(_ => this.closeDialog())
    );

    this.dialogRef.keydownEvents().subscribe(event => {
      const ESCAPE = event.keyCode === 27;
      if (ESCAPE) {
        this.closeDialog();
        return;
      }
      const CTRL_S = (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.keyCode === 83;
      if (CTRL_S) {
        event.preventDefault();
        if (!this.formsStateService.readOnly().isReadOnly)
          this.saveAll(false);
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
