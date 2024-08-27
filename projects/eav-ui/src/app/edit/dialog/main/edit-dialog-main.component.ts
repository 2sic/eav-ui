import { AfterViewInit, Component, computed, effect, inject, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import 'reflect-metadata';
import { BehaviorSubject, combineLatest, delay, fromEvent, map, Observable, of, startWith } from 'rxjs';
import { BaseComponent } from '../../../shared/components/base.component';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder.component';
import { FormulaDesignerService } from '../../formulas/formula-designer.service';
import { EavItem } from '../../shared/models/eav';
import { EavEntityBundleDto } from '../../shared/models/json-format-v1';
import { EditEntryComponent } from '../entry/edit-entry.component';
import { EditDialogMainViewModel, SaveEavFormData } from './edit-dialog-main.models';
import { SnackBarSaveErrorsComponent } from './snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldErrorMessage, SaveErrorsSnackBarData } from './snack-bar-save-errors/snack-bar-save-errors.models';
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
import { PickerTreeDataHelper } from '../../fields/picker/picker-tree/picker-tree-data-helper';
import { ValidationMessagesHelpers } from '../../shared/validation/validation-messages.helpers';
import { FormConfigService } from '../../state/form-config.service';
import { FormsStateService } from '../../state/forms-state.service';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { LoadIconsService } from '../../shared/services/load-icons.service';
import { MetadataDecorators } from '../../state/metadata-decorators.constants';
import { SaveResult } from '../../state/save-result.model';
import { GlobalConfigService } from '../../../shared/services/global-config.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentTypeItemService } from '../../shared/store/content-type-item.service';
import { ContentTypeService } from '../../shared/store/content-type.service';
import { InputTypeService } from '../../shared/store/input-type.service';
import { ItemService } from '../../shared/store/item.service';
import { LanguageService } from '../../shared/store/language.service';
import { LanguageInstanceService } from '../../shared/store/language-instance.service';
import { PublishStatusService } from '../../shared/store/publish-status.service';
import { AdamCacheService } from '../../shared/store/adam-cache.service';
import { LinkCacheService } from '../../shared/store/link-cache.service';

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

  // TODO:: @2g Question Items bug, reopen not working
  // TODO: @2dg - what did you mean by this?
  // protected items = this.itemService.getItemsSignal(this.formConfig.config.itemGuids);

  protected formsValid = this.formsStateService.formsValidTemp;
  protected saveButtonDisabled = this.formsStateService.saveButtonDisabled;
  protected hideHeader = this.languageStore.getHideHeaderSignal(this.formConfig.config.formId);;

  private loadIconsService = transient(LoadIconsService);
  private formDataService = transient(FormDataService);


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

  protected delayForm = toSignal(
    of(false).pipe(
      delay(0),
      startWith(true)
    ));


  constructor(
    private dialogRef: MatDialogRef<EditEntryComponent>,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageStore: LanguageInstanceService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private publishStatusService: PublishStatusService,
    private formsStateService: FormsStateService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
    this.dialogRef.disableClose = true;

    // Watch to save based on messages from sub-dialogs.
    effect(() => {
      const { tryToSave, close } = this.formsStateService.triggerTrySaveAndMaybeClose();
      if (!tryToSave) return;
      this.saveAll(close);
    });
  }



  ngOnInit() {
    this.editRoutingService.init();
    this.loadIconsService.load();
    this.formsStateService.init();
    this.formulaDesignerService.init();
    const items$ = this.itemService.getMany$(this.formConfig.config.itemGuids);

    // TODO:: @2g Question viewInitiated
    this.viewModel$ = combineLatest([items$, this.viewInitiated$]).pipe(
      map(([items, viewInitiated]) => ({
        items,
        viewInitiated,
      } satisfies EditDialogMainViewModel)),
    );
    this.startSubscriptions();
    this.activateCtrlSaveListener();
  }

  ngAfterViewInit() {
    setTimeout(() => this.viewInitiated$.next(true));
  }

  ngOnDestroy() {
    this.viewInitiated$.complete();
    this.languageStore.remove(this.formConfig.config.formId);
    this.publishStatusService.remove(this.formConfig.config.formId);

    if (this.formConfig.config.isParentDialog) {
      // clear the rest of the store
      this.languageStore.clearCache();
      this.languageService.clearCache();
      this.itemService.clearCache();
      this.inputTypeService.clearCache();
      this.contentTypeItemService.clearCache();
      this.contentTypeService.clearCache();
      this.publishStatusService.clearCache();
      this.adamCacheService.clearCache();
      this.linkCacheService.clearCache();
    }
    super.ngOnDestroy();
  }

  closeDialog(forceClose?: boolean) {
    if (forceClose) {
      this.dialogRef.close(this.formConfig.config.createMode ? this.saveResult : undefined);
    } else if (!this.formsStateService.readOnly().isReadOnly && this.formsStateService.formsAreDirty()) {
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
    if (this.formsStateService.formsAreValid()) {

      const items = this.formBuilderRefs
        .map(formBuilderRef => {
          const eavItem = this.itemService.get(formBuilderRef.entityGuid);
          const isValid = this.formsStateService.getFormValid(eavItem.Entity.Guid);
          if (!isValid)
            return null;

          // do not try to save item which doesn't have any fields, nothing could have changed about it
          // but enable saving if there is a special metadata
          const hasAttributes = Object.keys(eavItem.Entity.Attributes).length > 0;
          const contentType = this.contentTypeService.getContentTypeOfItem(eavItem);
          const saveIfEmpty = contentType.Metadata.some(m => m.Type.Name === MetadataDecorators.SaveEmptyDecorator);
          if (!hasAttributes && !saveIfEmpty)
            return null;

          const item = EavEntityBundleDto.bundleToDto(eavItem);
          return item;
        })
        .filter(item => item != null);

      const publishStatus = this.publishStatusService.get(this.formConfig.config.formId);

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
          this.itemService.updater.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsAreDirty.set(false);
          this.saveResult = result;
          if (close)
            this.closeDialog();
        },
        error: err => {
          l.a('SAVE FAILED:', err);
          this.snackBar.open('Error', null, { duration: 2000 });
        },
      });
    } else {
      // Case form is not valid

      // check if there is even a formBuilder to process, otherwise exit
      if (this.formBuilderRefs == null)
        return;

      const formErrors: Record<string, string>[] = [];
      this.formBuilderRefs.forEach(formBuilderRef => {
        if (!formBuilderRef.form.invalid)
          return;
        formErrors.push(ValidationMessagesHelpers.validateForm(formBuilderRef.form));
      });

      const fieldErrors: FieldErrorMessage[] = [];
      formErrors.forEach(formError => {
        Object.keys(formError).forEach(key => {
          fieldErrors.push({ field: key, message: formError[key] });
        });
      });

      this.snackBar.openFromComponent(SnackBarSaveErrorsComponent, {
        data: {
          fieldErrors,
        } satisfies SaveErrorsSnackBarData,
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
        if (this.formsStateService.readOnly().isReadOnly || !this.formsStateService.formsAreDirty()) { return; }
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.snackBarYouHaveUnsavedChanges();
      })
    );

    this.subscriptions.add(
      this.dialogRef.backdropClick().subscribe(_ => this.closeDialog())
    );
  }

  private activateCtrlSaveListener() {
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
