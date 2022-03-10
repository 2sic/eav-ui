import { DragDrop, DragRef } from '@angular/cdk/drag-drop';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { EditForm, EditItem } from '../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { GeneralHelpers, LocalizationHelpers } from '../../../shared/helpers';
import { EavEntity, EavHeader, EavItem } from '../../../shared/models/eav';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { getItemForTooltip, getNoteProps } from './entity-wrapper.helpers';
import { ContentTypeTemplateVars } from './entity-wrapper.models';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
})
export class EntityWrapperComponent implements OnInit, OnDestroy {
  @ViewChild('noteTrigger') private noteTriggerRef?: MatMenuTrigger;
  @ViewChild('overlayTrigger', { read: ElementRef }) private overlayTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('overlayTemplate') private overlayTemplateRef?: TemplateRef<undefined>;

  @Input() entityGuid: string;
  @Input() group: FormGroup;

  collapse: boolean;
  templateVars$: Observable<ContentTypeTemplateVars>;

  private dragRef: DragRef;
  private overlayRef: OverlayRef;
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
    private dragDropService: DragDrop,
    private overlayService: Overlay,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.collapse = false;
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

    this.templateVars$ = combineLatest([
      combineLatest([readOnly$, currentLanguage$, defaultLanguage$]),
      combineLatest([itemForTooltip$, header$, settings$, noteProps$]),
    ]).pipe(
      map(([
        [readOnly, currentLanguage, defaultLanguage],
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
        };
        return templateVars;
      }),
    );

    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.closeOverlay();
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

  openNote(event: PointerEvent | MouseEvent) {
    if (event instanceof PointerEvent && event.type === 'pointerenter' && event.pointerType === 'touch') { return; }
    this.noteTriggerRef?.openMenu();
  }

  closeNote(event: PointerEvent | MouseEvent) {
    if (event instanceof PointerEvent && event.type === 'pointerleave' && event.pointerType === 'touch') { return; }
    this.noteTriggerRef?.closeMenu();
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

  toggleOverlay(open?: boolean) {
    open ??= !this.overlayRef?.hasAttached();

    if (!open) {
      this.closeOverlay();
      return;
    }

    const triggerElement = this.overlayTriggerRef.nativeElement;
    const overlayConfig: OverlayConfig = {
      positionStrategy: this.overlayService.position()
        .flexibleConnectedTo(triggerElement)
        .withPositions([
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top',
          },
        ])
        .withFlexibleDimensions(false)
        .withPush(false),
    };
    this.overlayRef = this.overlayService.create(overlayConfig);
    const overlayPortal = new TemplatePortal<undefined>(this.overlayTemplateRef, this.viewContainerRef);
    this.overlayRef.attach(overlayPortal);
    this.overlayRef.updatePosition();
    const initialOverlayPosition = this.overlayRef.overlayElement.getBoundingClientRect();
    this.overlayRef.updatePositionStrategy(this.overlayService.position().global().top(`${initialOverlayPosition.top}px`).left(`${initialOverlayPosition.left}px`));

    this.dragRef = this.dragDropService.createDrag(this.overlayRef.overlayElement);
    this.dragRef.withHandles(Array.from(this.overlayRef.overlayElement.querySelectorAll<HTMLElement>('.note-actions')));
    this.dragRef.withBoundaryElement(document.body);
    this.dragRef.ended.subscribe(() => {
      const overlayPosition = this.overlayRef.overlayElement.getBoundingClientRect();
      this.overlayRef.updatePositionStrategy(this.overlayService.position().global().top(`${overlayPosition.top}px`).left(`${overlayPosition.left}px`));
      this.dragRef.reset();
    });
  }

  private closeOverlay() {
    this.dragRef?.dispose();
    this.overlayRef?.dispose();
  }
}
