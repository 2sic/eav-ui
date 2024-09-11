import { AfterViewChecked, Component, ElementRef, inject, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, input } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { eavConstants } from '../../../shared/constants/eav.constants';
import { EditForm, EditPrep, ItemIdentifierHeader } from '../../../shared/models/edit-form.model';
import { EavEntity, EavItem } from '../../shared/models/eav';
import { buildContentTypeFeatures, getItemForTooltip, getNoteProps } from '../entity-form.helpers';
import { ChangeAnchorTargetDirective } from '../../fields/directives/change-anchor-target.directive';
import { EntityTranslateMenuComponent } from '../entity-translate-menu/entity-translate-menu.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatCardModule } from '@angular/material/card';
import { FormDataService } from '../../form/form-data.service';
import { EditControlsBuilderDirective } from '../../fields/builder/fields-builder.directive';
import { FeatureNames } from '../../../features/feature-names';
import { MousedownStopPropagationDirective } from '../../../shared/directives/mousedown-stop-propagation.directive';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { FeaturesService } from '../../../features/features.service';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FormConfigService } from '../../form/form-config.service';
import { FormsStateService } from '../../form/forms-state.service';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { EntityService } from '../../../shared/services/entity.service';
import { transient } from '../../../core';
import { ItemService } from '../../state/item.service';
import { DialogRoutingService } from '../../../shared/routing/dialog-routing.service';
import { EditForceReloadService } from '../../routing/edit-force-reload.service';
import { computedObj, signalObj } from '../../../shared/signals/signal.utilities';
import { EntityReader } from '../../shared/helpers/entity-reader';

const logSpecs = {
  enabled: false,
  name: 'EntityFormComponent',
  specs: {
    all: false,
    fetchNote: true,
    noteFormData: true,
  }
};

/**
 * This wraps a single entity in the multi-entities-form.
 */
@Component({
  selector: 'app-edit-entity-form',
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    FlexModule,
    MatIconModule,
    MatButtonModule,
    CdkDrag,
    CdkDragHandle,
    MatSlideToggleModule,
    EntityTranslateMenuComponent,
    ChangeAnchorTargetDirective,
    EditControlsBuilderDirective,
    TranslateModule,
    TippyDirective,
    SafeHtmlPipe,
    MousedownStopPropagationDirective,
  ],
})
export class EntityFormComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('noteTrigger', { read: ElementRef }) private noteTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('noteTemplate') private noteTemplateRef?: TemplateRef<undefined>;

  entityGuid = input<string>();

  protected formConfig = inject(FormConfigService);
  #fieldsSettingsSvc = inject(FieldsSettingsService);
  #formsStateSvc = inject(FormsStateService);
  #translate = inject(TranslateService);
  #versioningReloader = transient(EditForceReloadService);

  collapse = false;
  noteTouched: boolean = false;

  #features = inject(FeaturesService);
  #editUiShowNotes = this.#features.isEnabled(FeatureNames.EditUiShowNotes);
  #editUiShowMetadataFor = this.#features.isEnabled(FeatureNames.EditUiShowMetadataFor);

  /** Languages */
  languages = this.formConfig.language;

  /** Content-Type Settings */
  ctSettings = computedObj('ctSettings', () => {
    const s = this.#fieldsSettingsSvc.contentTypeSettings();
    const features = s.Features;
    const ctFeatures = buildContentTypeFeatures(s.Features);

    return {
      itemTitle: s._itemTitle,
      slotCanBeEmpty: s._slotCanBeEmpty,
      slotIsEmpty: s._slotIsEmpty,
      editInstructions: s.EditInstructions,
      features,
      showNotes: ctFeatures[FeatureNames.EditUiShowNotes] ?? this.#editUiShowNotes(),
      showMdFor: ctFeatures[FeatureNames.EditUiShowMetadataFor] ?? this.#editUiShowMetadataFor(),
    };
  });

  readOnly = computedObj('readOnly', () => this.#formsStateSvc.readOnly().isReadOnly);

  /** Item-For (Target) Tooltip */
  itemForTooltip = computedObj('itemForTooltip', () => {
    const item = this.itemSvc.getItemFor(this.entityGuid());
    return getItemForTooltip(item, this.#translate);
  });

  #retriggerNoteProps = signalObj<boolean>('retriggerNoteProps', false);
  noteProps = computedObj('noteProps', () => {
    this.#retriggerNoteProps(); // dependency to retrigger when #retriggerNoteProps changes
    const entityGuid = this.entityGuid();
    const languages = this.formConfig.language();
    const note = this.itemSvc.getItemNote(entityGuid);
    const notCreatedYet = this.itemSvc.get(entityGuid).Entity.Id === 0;
    return getNoteProps(note, languages, notCreatedYet);
  });

  private noteRef?: MatDialogRef<undefined, any>;

  #formDataSvc = transient(FormDataService);
  #entitySvc = transient(EntityService);
  #dialogRouter = transient(DialogRoutingService);

  log = new EavLogger(logSpecs);
  constructor(
    private itemSvc: ItemService,
    private editRoutingSvc: EditRoutingService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
  }

  ngAfterViewChecked() {
    // change detection inside note template seems to be independent of this component and without forcing checks
    // throws ExpressionChangedAfterItHasBeenCheckedError
    (this.noteRef?._containerInstance as any)?._changeDetectorRef?.detectChanges();
  }

  ngOnInit() {
    // Update the notes whenever a child form is closed
    this.#dialogRouter.doOnDialogClosed(() => this.#fetchNote());
  }

  ngOnDestroy() {
    this.noteRef?.close();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  toggleSlotIsEmpty() {
    const entityGuid = this.entityGuid();
    const oldHeader = this.itemSvc.getItemHeader(entityGuid);
    const newHeader: ItemIdentifierHeader = {
      ...oldHeader,
      IsEmpty: !oldHeader.IsEmpty,
    };
    const l = this.log.fn('toggleSlotIsEmpty', { oldHeader, newHeader });
    this.itemSvc.updater.updateItemHeader(entityGuid, newHeader);
    l.end();
  }

  openHistory() {
    const item = this.itemSvc.get(this.entityGuid());
    this.#versioningReloader.watchToRefreshOnVersionsClosed();
    this.#dialogRouter.navRelative([`versions/${item.Entity.Id}`]);
  }

  toggleNote(event: Event) {
    const isOpen = this.noteRef?.getState() === MatDialogState.OPEN;
    if (event.type === 'pointerenter' && this.noteTouched == false) this.openNote();
    else if (event.type === 'pointerleave' && this.noteTouched == false) this.noteRef?.close();
    else if (event.type === 'click' && isOpen) {
      if (this.noteTouched == false)
        this.noteTouched = true;
      else {
        this.noteRef?.close();
        this.noteTouched = false;
      }
    }
  }

  openNote() {
    const triggerPosition = this.noteTriggerRef.nativeElement.getBoundingClientRect();
    this.noteRef = this.dialog.open(this.noteTemplateRef, {
      autoFocus: false,
      hasBackdrop: false,
      disableClose: true,
      restoreFocus: false,
      closeOnNavigation: false,
      position: {
        top: `${triggerPosition.bottom}px`,
        left: `${triggerPosition.left}px`,
      },
      viewContainerRef: this.viewContainerRef,
      panelClass: 'note-dialog',
    });
  }

  editNote(note?: EavEntity) {
    const entityGuid = this.entityGuid();
    const l = this.log.fn('editNote', { note });
    const item = this.itemSvc.get(entityGuid);
    if (item.Entity.Id === 0) {
      l.end('Item not saved yet, ID = 0');
      return;
    }

    const form: EditForm = {
      items: [
        note == null
          ? EditPrep.newMetadata(entityGuid, eavConstants.contentTypes.notes, eavConstants.metadata.entity, true)
          : EditPrep.editId(note.Id),
      ],
    };
    this.editRoutingSvc.open(null, null, form);
  }

  deleteNote(note: EavEntity) {
    const language = this.formConfig.language();
    const title = new EntityReader(language).getBestValue(note.Attributes.Title); // LocalizationHelpers.translate(language, note.Attributes.Title, null);
    const id = note.Id;
    if (!confirm(this.#translate.instant('Data.Delete.Question', { title, id })))
      return;
    this.#entitySvc.delete(this.formConfig.config.appId, eavConstants.contentTypes.notes, note.Id, false).subscribe(() => {
      this.noteRef?.close();
      this.#fetchNote();
    });
  }

  #fetchNote() {
    const entityGuid = this.entityGuid();
    const item = this.itemSvc.get(entityGuid);
    const l = this.log.fnIf('fetchNote', { entityGuid, item, id: item.Entity.Id });
    if (item.Entity.Id === 0)
      return l.end('no change');

    const editItems = [EditPrep.editId(item.Entity.Id)];
    this.#formDataSvc.fetchFormData(JSON.stringify(editItems))
      .subscribe(formData => {
        const l2 = this.log.fn('noteFormData', { formData });
        // Check if the item is still in the service being edited, as it could have been flushed when this triggers on version-restore
        if (!this.itemSvc.get(entityGuid))
          return l2.end(`Item ${entityGuid} not found in service, was probably flushed for reload`);

        // Parse and update the note metadata
        const items = formData.Items.map(i => EavItem.convert(i));
        this.itemSvc.updater.updateItemMetadata(entityGuid, items[0].Entity.Metadata);
        this.#retriggerNoteProps.set(true);
        l2.end('updated note');
      });
    l.end('started note-loading');
  }
}
