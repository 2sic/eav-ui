import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { EditForm, EditItem } from '../../../../shared/models/edit-form.model';
import { FeaturesConstants } from '../../../shared/constants';
import { GeneralHelpers, LocalizationHelpers } from '../../../shared/helpers';
import { EavEntity, EavHeader, EavItem } from '../../../shared/models/eav';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { FeatureService, ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { buildContentTypeFeatures, getItemForTooltip, getNoteProps } from './entity-wrapper.helpers';
import { ContentTypeTemplateVars } from './entity-wrapper.models';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
})
export class EntityWrapperComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('noteTrigger', { read: ElementRef }) private noteTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('noteTemplate') private noteTemplateRef?: TemplateRef<undefined>;

  @Input() entityGuid: string;
  @Input() group: FormGroup;

  collapse = false;
  noteTouched: boolean;
  templateVars$: Observable<ContentTypeTemplateVars>;

  private noteRef?: MatDialogRef<undefined, any>;
  private subscription: Subscription;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettingsService: FieldsSettingsService,
    public eavService: EavService,
    private translate: TranslateService,
    private formsStateService: FormsStateService,
    private editRoutingService: EditRoutingService,
    private entityService: EntityService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private featureService: FeatureService,
  ) { }

  ngAfterViewChecked() {
    // change detection inside note template seems to be independent of this component and without forcing checks
    // throws ExpressionChangedAfterItHasBeenCheckedError
    (this.noteRef?._containerInstance as any)?._changeDetectorRef?.detectChanges();
  }

  ngOnInit() {
    this.subscription = new Subscription();
    const readOnly$ = this.formsStateService.readOnly$;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const itemForTooltip$ = this.itemService.getItemFor$(this.entityGuid).pipe(
      map(itemFor => getItemForTooltip(itemFor, this.translate)),
    );
    const header$ = this.itemService.getItemHeader$(this.entityGuid);
    const settings$ = this.fieldsSettingsService.getContentTypeSettings$().pipe(
      map(settings => ({
        _itemTitle: settings._itemTitle,
        _slotCanBeEmpty: settings._slotCanBeEmpty,
        _slotIsEmpty: settings._slotIsEmpty,
        EditInstructions: settings.EditInstructions,
        Features: settings.Features,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    const note$ = this.itemService.getItemNote$(this.entityGuid);
    const itemNotSaved$ = this.itemService.getItem$(this.entityGuid).pipe(
      map(item => item.Entity.Id === 0),
      distinctUntilChanged(),
    );
    const noteProps$ = combineLatest([note$, currentLanguage$, defaultLanguage$, itemNotSaved$]).pipe(
      map(([note, currentLanguage, defaultLanguage, itemNotSaved]) => getNoteProps(note, currentLanguage, defaultLanguage, itemNotSaved)),
    );
    const showNotes$ = combineLatest([
      this.featureService.isFeatureEnabled$(FeaturesConstants.EditUiShowNotes),
      settings$.pipe(map(settings => buildContentTypeFeatures(settings.Features))),
    ]).pipe(
      map(([featureEnabled, contentTypeFeatures]) => contentTypeFeatures[FeaturesConstants.EditUiShowNotes] ?? featureEnabled),
      distinctUntilChanged(),
    );
    const showMetadataFor$ = combineLatest([
      this.featureService.isFeatureEnabled$(FeaturesConstants.EditUiShowMetadataFor),
      settings$.pipe(map(settings => buildContentTypeFeatures(settings.Features))),
    ]).pipe(
      map(([featureEnabled, contentTypeFeatures]) => contentTypeFeatures[FeaturesConstants.EditUiShowMetadataFor] ?? featureEnabled),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([
      combineLatest([readOnly$, currentLanguage$, defaultLanguage$, showNotes$, showMetadataFor$]),
      combineLatest([itemForTooltip$, header$, settings$, noteProps$]),
    ]).pipe(
      map(([
        [readOnly, currentLanguage, defaultLanguage, showNotes, showMetadataFor],
        [itemForTooltip, header, settings, noteProps],
      ]) => {
        const templateVars: ContentTypeTemplateVars = {
          readOnly: readOnly.isReadOnly,
          currentLanguage,
          defaultLanguage,
          header,
          itemTitle: settings._itemTitle,
          slotCanBeEmpty: settings._slotCanBeEmpty,
          slotIsEmpty: settings._slotIsEmpty,
          editInstructions: settings.EditInstructions,
          itemForTooltip,
          noteProps,
          showNotes,
          showMetadataFor,
        };
        return templateVars;
      }),
    );

    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.noteRef?.close();
    this.subscription.unsubscribe();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  toggleSlotIsEmpty(oldHeader: EavHeader) {
    const newHeader: EavHeader = { ...oldHeader, Group: { ...oldHeader.Group, SlotIsEmpty: !oldHeader.Group.SlotIsEmpty } };
    this.itemService.updateItemHeader(this.entityGuid, newHeader);
  }

  openHistory() {
    const item = this.itemService.getItem(this.entityGuid);
    this.router.navigate([`versions/${item.Entity.Id}`], { relativeTo: this.route });
  }

  toggleNote(event?: PointerEvent | MouseEvent, open?: boolean) {
    if (
      event instanceof PointerEvent && event.pointerType === 'touch'
      && (event.type === 'pointerenter' || event.type === 'pointerleave')
    ) { return; }

    const isOpen = this.noteRef?.getState() === MatDialogState.OPEN;
    open ??= this.noteRef?.getState() !== MatDialogState.OPEN;
    if (isOpen === open) { return; }

    this.noteTouched = false;
    if (!open) {
      this.noteRef?.close();
      return;
    }

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
    const item = this.itemService.getItem(this.entityGuid);
    if (item.Entity.Id === 0) { return; }

    const form: EditForm = {
      items: [
        note == null
          ? {
            ContentTypeName: eavConstants.contentTypes.notes,
            For: {
              Target: eavConstants.metadata.entity.target,
              TargetType: eavConstants.metadata.entity.targetType,
              Guid: this.entityGuid,
              Singleton: true,
            }
          }
          : { EntityId: note.Id }
      ],
    };
    this.editRoutingService.open(null, null, form);
  }

  deleteNote(note: EavEntity) {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    const title = LocalizationHelpers.translate(currentLanguage, defaultLanguage, note.Attributes.Title, null);
    const id = note.Id;
    if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
    this.entityService.delete(eavConstants.contentTypes.notes, note.Id, false).subscribe(() => {
      this.toggleNote(undefined, false);
      this.fetchNote();
    });
  }

  private fetchNote() {
    const item = this.itemService.getItem(this.entityGuid);
    if (item.Entity.Id === 0) { return; }

    const editItems: EditItem[] = [{ EntityId: item.Entity.Id }];
    this.eavService.fetchFormData(JSON.stringify(editItems)).subscribe(formData => {
      const items = formData.Items.map(item1 => EavItem.convert(item1));
      this.itemService.updateItemMetadata(this.entityGuid, items[0].Entity.Metadata);
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchNote();
      })
    );
  }
}
