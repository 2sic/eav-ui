import { CdkScrollable } from '@angular/cdk/scrolling';
import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, OnDestroy, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import 'reflect-metadata';
import { delay, fromEvent, of, startWith } from 'rxjs';
import { transient } from '../../../../../../core';
import { BaseComponent } from '../../../shared/components/base.component';
import { ToggleDebugDirective } from '../../../shared/directives/toggle-debug.directive';
import { classLog } from '../../../shared/logging';
import { ExtendedFabSpeedDialImports } from '../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { GlobalConfigService } from '../../../shared/services/global-config.service';
import { computedWithPrev } from '../../../shared/signals/signal.utilities';
import { UserSettings } from '../../../shared/user/user-settings.service';
import { LoadIconsService } from '../../assets/icons/load-icons.service';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder.component';
import { PickerTreeDataHelper } from '../../fields/picker/picker-tree/picker-tree-data-helper';
import { FormConfigService } from '../../form/form-config.service';
import { FormDataService } from '../../form/form-data.service';
import { FormLanguageService } from '../../form/form-language.service';
import { FormPublishingService } from '../../form/form-publishing.service';
import { FormsStateService } from '../../form/forms-state.service';
import { FormulaDesignerService } from '../../formulas/designer/formula-designer.service';
import { LanguageService } from '../../localization/language.service';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { AdamCacheService } from '../../shared/adam/adam-cache.service';
import { LinkCacheService } from '../../shared/adam/link-cache.service';
import { ContentTypeItemService } from '../../shared/content-types/content-type-item.service';
import { ContentTypeService } from '../../shared/content-types/content-type.service';
import { InputTypeService } from '../../shared/input-types/input-type.service';
import { EavEntityBundleDto } from '../../shared/models/json-format-v1';
import { ValidationMsgHelper } from '../../shared/validation/validation-messages.helpers';
import { ItemService } from '../../state/item.service';
import { MetadataDecorators } from '../../state/metadata-decorators.constants';
import { SaveResult } from '../../state/save-result.model';
import { EditEntryComponent } from '../entry/edit-entry.component';
import { EditDialogFooterComponent } from '../footer/edit-dialog-footer.component';
import { EditDialogHeaderComponent } from '../header/edit-dialog-header.component';
import { SaveEavFormData } from './edit-dialog-main.models';
import { FormSlideDirective } from './form-slide.directive';
import { isCtrlS, isEscape } from './keyboard-shortcuts';
import { SnackBarSaveErrorsComponent } from './snack-bar-save-errors/snack-bar-save-errors.component';
import { FieldErrorMessage, SaveErrorsSnackBarData } from './snack-bar-save-errors/snack-bar-save-errors.models';
import { SnackBarUnsavedChangesComponent } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.component';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';

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
    // This is shared across all entities on this form
    FormulaDesignerService,

    // TODO: probably move to each picker component (Errors)
    PickerTreeDataHelper,
  ],
})
export class EditDialogMainComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  log = classLog({EditDialogMainComponent});

  @ViewChildren(EntityFormBuilderComponent) formBuilderRefs: QueryList<EntityFormBuilderComponent>;

  #globalConfigService = inject(GlobalConfigService);
  #formConfig = inject(FormConfigService);

  #loadIconsService = transient(LoadIconsService);
  #formDataService = transient(FormDataService);

  protected viewInitiated = signal(false);

  constructor(
    private dialog: MatDialogRef<EditEntryComponent>,
    private contentTypeItemService: ContentTypeItemService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private itemService: ItemService,
    private languageService: LanguageService,
    private languageStore: FormLanguageService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private publishStatusService: FormPublishingService,
    private formsStateService: FormsStateService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    super();
    this.dialog.disableClose = true;

    // Watch to save based on messages from sub-dialogs.
    effect(() => {
      const { tryToSave, close } = this.formsStateService.triggerTrySaveAndMaybeClose();
      if (!tryToSave) return;
      this.saveAll(close);
    });
  }

  #saveResult: SaveResult;

  protected items = this.itemService.getManySignal(this.#formConfig.config.itemGuids);

  protected formsValid = this.formsStateService.formsValidTemp;
  protected saveButtonDisabled = this.formsStateService.saveButtonDisabled;
  protected hideHeader = this.languageStore.getHideHeaderSignal(this.#formConfig.config.formId);

  //#region Footer - Show once or more, hide again, and expand footer (extra large footer)

  /** Signal to determine if we should show the footer. Will affect style.display of the footer tag */
  protected footerShow = computed(() => {
    // if debug is true, then it was set once using the magic shortcut
    if (this.#globalConfigService.isDebug()) {
      this.#debugWasModified = true;
      return true;
    }

    // If debug is false, and was never modified, show based on system admin status
    return !this.#debugWasModified && this.#formConfig.config.dialogContext.User?.IsSystemAdmin;
  });

  /** Show footer once or more - basically stays true if it was ever shown */
  protected footerShowOnceOrMore = computedWithPrev(prev => prev || this.footerShow(), false);

  /** Special variable to check if debug was ever triggered, to allow super-users to re-hide the footer */
  #debugWasModified = false;

  /** Signal to tell the UI that the footer needs more space (changes CSS) */
  #footerUserSettings = inject(UserSettings).part(EditDialogFooterComponent.userSettings)
  footerSize = computed(() => this.#footerUserSettings.data().size);

  //#endregion

  /** delay showing the form, but not quite sure why. maybe to prevent flickering? */
  protected delayForm = toSignal(
    of(false).pipe(
      delay(0),
      startWith(true)
    ));


  ngOnInit() {
    this.editRoutingService.init();
    this.#loadIconsService.load();
    this.formsStateService.init();
    this.formulaDesignerService.cache.init();

    this.#startSubscriptions();
    this.#watchKeyboardShortcuts();
  }

  ngAfterViewInit() {
    setTimeout(() => this.viewInitiated.set(true));
  }

  ngOnDestroy() {
    this.languageStore.remove(this.#formConfig.config.formId);
    this.publishStatusService.remove(this.#formConfig.config.formId);

    if (this.#formConfig.config.isParentDialog) {
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
      this.dialog.close(this.#formConfig.config.createMode ? this.#saveResult : undefined);
    } else if (!this.formsStateService.readOnly().isReadOnly && this.formsStateService.formsAreDirty()) {
      this.#snackBarYouHaveUnsavedChanges();
    } else {
      this.dialog.close(this.#formConfig.config.createMode ? this.#saveResult : undefined);
    }
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

      const publishStatus = this.publishStatusService.get(this.#formConfig.config.formId);

      const saveFormData: SaveEavFormData = {
        Items: items,
        IsPublished: publishStatus.IsPublished,
        DraftShouldBranch: publishStatus.DraftShouldBranch,
      };
      l.a('SAVE FORM DATA:', { saveFormData });
      this.snackBar.open(this.translate.instant('Message.Saving'), null, { duration: 2000 });

      this.#formDataService.saveFormData(saveFormData, this.#formConfig.config.partOfPage).subscribe({
        next: result => {
          l.a('SAVED!, result:', { result, close });
          this.itemService.updater.updateItemId(result);
          this.snackBar.open(this.translate.instant('Message.Saved'), null, { duration: 2000 });
          this.formsStateService.formsAreDirty.set(false);
          this.#saveResult = result;
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
        formErrors.push(ValidationMsgHelper.validateForm(formBuilderRef.form));
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

  #startSubscriptions() {
    this.subscriptions.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
        if (this.formsStateService.readOnly().isReadOnly || !this.formsStateService.formsAreDirty()) return;
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.#snackBarYouHaveUnsavedChanges();
      })
    );

    this.subscriptions.add(
      this.dialog.backdropClick().subscribe(_ => this.closeDialog())
    );
  }

  #watchKeyboardShortcuts() {
    this.dialog.keydownEvents().subscribe(event => {
      if (isEscape(event)) {
        this.closeDialog();
        return;
      }

      if (isCtrlS(event)) {
        event.preventDefault();
        if (!this.formsStateService.readOnly().isReadOnly)
          this.saveAll(event.altKey);
        return;
      }
    });
  }

  #snackBarYouHaveUnsavedChanges() {
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data: {
        save: false,
      } satisfies UnsavedChangesSnackBarData,
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if ((snackBarRef.containerInstance.snackBarConfig.data as UnsavedChangesSnackBarData).save)
        this.saveAll(true);
      else
        this.closeDialog(true);
    });
  }
}
