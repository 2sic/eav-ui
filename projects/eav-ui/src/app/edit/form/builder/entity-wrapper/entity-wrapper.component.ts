import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { EditForm, ItemEditIdentifier } from '../../../../shared/models/edit-form.model';
import { GeneralHelpers, LocalizationHelpers } from '../../../shared/helpers';
import { EavEntity, EavHeader, EavItem } from '../../../shared/models/eav';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { buildContentTypeFeatures, getItemForTooltip, getNoteProps } from './entity-wrapper.helpers';
import { ContentTypeTemplateVars } from './entity-wrapper.models';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
})
export class EntityWrapperComponent extends BaseSubsinkComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('noteTrigger', { read: ElementRef }) private noteTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('noteTemplate') private noteTemplateRef?: TemplateRef<undefined>;

  @Input() entityGuid: string;
  @Input() group: UntypedFormGroup;

  collapse = false;
  noteTouched: boolean = false;
  templateVars$: Observable<ContentTypeTemplateVars>;

  private noteRef?: MatDialogRef<undefined, any>;

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
    private featuresService: FeaturesService,
  ) { 
    super();
  }

  ngAfterViewChecked() {
    // change detection inside note template seems to be independent of this component and without forcing checks
    // throws ExpressionChangedAfterItHasBeenCheckedError
    (this.noteRef?._containerInstance as any)?._changeDetectorRef?.detectChanges();
  }

  ngOnInit() {
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
      this.featuresService.isEnabled$(FeatureNames.EditUiShowNotes),
      settings$.pipe(map(settings => buildContentTypeFeatures(settings.Features))),
    ]).pipe(
      map(([featureEnabled, contentTypeFeatures]) => contentTypeFeatures[FeatureNames.EditUiShowNotes] ?? featureEnabled),
      distinctUntilChanged(),
    );
    const showMetadataFor$ = combineLatest([
      this.featuresService.isEnabled$(FeatureNames.EditUiShowMetadataFor),
      settings$.pipe(map(settings => buildContentTypeFeatures(settings.Features))),
    ]).pipe(
      map(([featureEnabled, contentTypeFeatures]) => contentTypeFeatures[FeatureNames.EditUiShowMetadataFor] ?? featureEnabled),
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
    super.ngOnDestroy();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  toggleSlotIsEmpty(oldHeader: EavHeader) {
    const newHeader: EavHeader = {
      ...oldHeader,
      IsEmpty: !oldHeader.IsEmpty,
    };
    this.itemService.updateItemHeader(this.entityGuid, newHeader);
  }

  openHistory() {
    const item = this.itemService.getItem(this.entityGuid);
    this.router.navigate([`versions/${item.Entity.Id}`], { relativeTo: this.route });
  }

  toggleNote(event: Event) {
    const isOpen = this.noteRef?.getState() === MatDialogState.OPEN;
    if (event.type === 'pointerenter' && this.noteTouched == false) this.openNote();
    else if (event.type === 'pointerleave' && this.noteTouched == false) this.noteRef?.close();
    else if (event.type === 'click' && isOpen) {
      if (this.noteTouched == false) this.noteTouched = true;
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
      this.noteRef?.close();
      this.fetchNote();
    });
  }

  private fetchNote() {
    const item = this.itemService.getItem(this.entityGuid);
    if (item.Entity.Id === 0) { return; }

    const editItems: ItemEditIdentifier[] = [{ EntityId: item.Entity.Id }];
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
