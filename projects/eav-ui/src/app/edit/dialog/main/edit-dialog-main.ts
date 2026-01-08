import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, OnDestroy, OnInit, QueryList, signal, untracked, ViewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { delay, fromEvent, of, startWith } from 'rxjs';
import { transient } from '../../../../../../core';
import { BaseComponent } from '../../../shared/components/base';
import { ToggleDebugDirective } from '../../../shared/directives/toggle-debug.directive';
import { classLog } from '../../../shared/logging';
import { ExtendedFabSpeedDialImports } from '../../../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SaveCloseButtonComponent } from '../../../shared/modules/save-close-button/save-close-button';
import { GlobalConfigService } from '../../../shared/services/global-config.service';
import { computedWithPrev } from '../../../shared/signals/signal.utilities';
import { UserPreferences } from '../../../shared/user/user-preferences.service';
import { LoadIconsService } from '../../assets/icons/load-icons.service';
import { EntityFormBuilderComponent } from '../../entity-form/entity-form-builder/form-builder';
import { PickerTreeDataHelper } from '../../fields/picker/picker-tree/picker-tree-data-helper';
import { FormConfigService } from '../../form/form-config.service';
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
import { ItemService } from '../../state/item.service';
import { SaveResult } from '../../state/save-result.model';
import { EditEntryComponent } from '../entry/edit-entry';
import { EditDialogFooterComponent } from '../footer/edit-dialog-footer';
import { footerPreferences } from '../footer/footer-preferences';
import { EditDialogHeaderComponent } from '../header/edit-dialog-header';
import { EditDialogSaveService } from './edit-dialog-save.service';
import { FormSlideDirective } from './form-slide.directive';
import { isCtrlEnter, isCtrlS, isEscape } from './keyboard-shortcuts';
import { SnackBarUnsavedChangesComponent } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes';
import { UnsavedChangesSnackBarData } from './snack-bar-unsaved-changes/snack-bar-unsaved-changes.models';

const logSpecs = {
  all: false,
  constructor: true,
  saveAll: true,
}

/**
 * The edit-main component is the complete edit component containing:
 * - Header (which also contains the languages and publish state)
 * - Each entity form
 * - Footer
 */
@Component({
  selector: 'app-edit-dialog-main',
  templateUrl: './edit-dialog-main.html',
  styleUrls: ['./edit-dialog-main.scss'],
  imports: [
    MatDialogActions,
    NgClass,
    EditDialogHeaderComponent,
    CdkScrollable,
    FormSlideDirective,
    EntityFormBuilderComponent,
    MatRippleModule,
    MatIconModule,
    EditDialogFooterComponent,
    TranslateModule,
    ...ExtendedFabSpeedDialImports,
    ToggleDebugDirective,
    SaveCloseButtonComponent,
  ],
  providers: [
    EditRoutingService,
    FormsStateService,
    // This is shared across all entities on this form
    FormulaDesignerService,
    // TODO: probably move to each picker component (Errors)
    PickerTreeDataHelper,
  ]
})
export class EditDialogMainComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  log = classLog({ EditDialogMainComponent }, logSpecs);

  @ViewChildren(EntityFormBuilderComponent) formBuilderRefs: QueryList<EntityFormBuilderComponent>;

  #globalConfigService = inject(GlobalConfigService);
  #formConfig = inject(FormConfigService);

  canSave = this.#formConfig.config.save.mode; // if false, then no save button is shown

  /** Signal to tell the UI if the footer should show and/or the footer needs more space (changes CSS) */
  #prefManager = inject(UserPreferences).part(footerPreferences)
  footerSize = computed(() => this.#prefManager.data().size);

  #loadIconsService = transient(LoadIconsService);

  protected viewInitiated = signal(false);

  itemService = inject(ItemService);
  contentTypeService = inject(ContentTypeService);
  formsStateService = inject(FormsStateService);
  publishStatusService = inject(FormPublishingService);
  translate = inject(TranslateService);

  /** Reference to the main dialog, for closing on esc. etc. */
  dialog: MatDialogRef<EditEntryComponent> = inject(MatDialogRef<EditEntryComponent>);

  saveSvc = transient(EditDialogSaveService);

  constructor(
    private contentTypeItemService: ContentTypeItemService,
    private inputTypeService: InputTypeService,
    private languageService: LanguageService,
    private languageStore: FormLanguageService,
    private snackBar: MatSnackBar,
    private editRoutingService: EditRoutingService,
    private adamCacheService: AdamCacheService,
    private linkCacheService: LinkCacheService,
    private formulaDesignerService: FormulaDesignerService,
  ) {
    super();
    const l = this.log.fnIf('constructor');
    this.dialog.disableClose = true;

    // Initialize default user preferences for footer show/hide
    const pref = this.#prefManager;
    if (pref.data().pinned == null)
      pref.set('pinned', this.#formConfig.config.dialogContext.User?.IsSystemAdmin ?? false);

    // Watch for the "try-save" event from the forms
    effect(() => {
      const current = this.formsStateService.triggerTrySaveAndMaybeClose();
      if (current.tryToSave)
        untracked(() => this.saveAll(current.close));
    });

  }

  protected items = this.itemService.getManySignal(this.#formConfig.config.itemGuids);

  protected formsValid = this.formsStateService.formsValidTemp;
  protected hideHeader = this.languageStore.getHideHeaderSignal(this.#formConfig.config.formId);


  //#region Footer - Show once or more, hide again, and expand footer (extra large footer)

  /** Signal to determine if we should show the footer. Will affect style.display of the footer tag */
  protected footerShow = computed(() => {
    // if debug is true, then it was set once using the keyboard shortcut
    if (this.#globalConfigService.isDebug()) {
      this.#debugWasModified = true;
      return true;
    }

    // If debug is false, and was never modified, show based on system admin status
    return !this.#debugWasModified && this.#prefManager.data().pinned;
  });

  /** Show footer once or more - basically stays true if it was ever shown */
  protected footerShowOnceOrMore = computedWithPrev(prev => prev || this.footerShow(), false);

  /** Special variable to check if debug was ever triggered, to allow super-users to re-hide the footer */
  #debugWasModified = false;

  //#endregion


  /** delay showing the form, but not quite sure why. maybe to prevent flickering? */
  protected delayForm = toSignal(
    of(false).pipe(
      delay(0),
      startWith(true)
    ));

  ngOnInit() {
    this.#watchKeyboardShortcuts();

    this.editRoutingService.init();
    this.#loadIconsService.load();
    this.formulaDesignerService.cache.init();

    this.#startSubscriptions();
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

  closeDialog(forceClose?: boolean, saveResult?: SaveResult): void {
    if (forceClose)
      return this.dialog.close(this.#formConfig.config.createMode ? saveResult : undefined);

    if (!this.formsStateService.readOnly().isReadOnly && this.formsStateService.formsAreDirty())
      return this.#snackBarYouHaveUnsavedChanges();

    this.dialog.close(this.#formConfig.config.createMode ? saveResult : undefined);
  }

  /** Save all forms */
  saveAll(close: boolean): void {
    const l = this.log.fnIf('saveAll', { close });

    this.saveSvc.saveAll(this, close);
    
    return l.end('saved default');
  }


  #startSubscriptions() {
    this.subscriptions.add(
      fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
        if (this.formsStateService.readOnly().isReadOnly || !this.formsStateService.formsAreDirty())
          return;
        event.preventDefault();
        event.returnValue = ''; // fix for Chrome
        this.#snackBarYouHaveUnsavedChanges();
      })
    );

    this.subscriptions.add(
      this.dialog.backdropClick().subscribe(_ => this.closeDialog())
    );
  }

  /**
   * Watch for keyboard shortcuts like Ctrl+S, Esc, etc.
   */
  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isEscape(event))
        return this.closeDialog();

      const canSave = !this.formsStateService.readOnly().isReadOnly
        && !this.saveSvc.entityFormStateService.isSaving();

      if (isCtrlS(event) && canSave) {
        event.preventDefault();
        this.saveAll(event.altKey);
      }

      if (isCtrlEnter(event) && canSave) {
        event.preventDefault();
        this.saveAll(true);
      }
    });
  }

  /**
   * Show snack bar warning about unsaved changes
   * and save/cancel depending on user action
   */
  #snackBarYouHaveUnsavedChanges(): void {
    const snackBarRef = this.snackBar.openFromComponent(SnackBarUnsavedChangesComponent, {
      data: {
        save: false,
      } satisfies UnsavedChangesSnackBarData,
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if ((snackBarRef.containerInstance.snackBarConfig.data as UnsavedChangesSnackBarData).save)
        return this.saveAll(true);

      this.closeDialog(true);
    });
  }
}
