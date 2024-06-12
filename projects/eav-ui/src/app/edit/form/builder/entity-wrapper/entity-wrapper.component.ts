import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { FeaturesService } from 'projects/eav-ui/src/app/shared/services/features.service';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { EditForm, ItemEditIdentifier, ItemIdentifierHeader } from '../../../../shared/models/edit-form.model';
import { GeneralHelpers, LocalizationHelpers } from '../../../shared/helpers';
import { EavEntity, EavItem } from '../../../shared/models/eav';
import { FormConfigService, EditRoutingService, EntityService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { buildContentTypeFeatures, getItemForTooltip, getNoteProps } from './entity-wrapper.helpers';
import { ContentTypeViewModel } from './entity-wrapper.models';
import { AsyncPipe } from '@angular/common';
import { FieldsBuilderDirective } from '../fields-builder/fields-builder.directive';
import { ChangeAnchorTargetDirective } from '../../../shared/directives/change-anchor-target.directive';
import { EntityTranslateMenuComponent } from './entity-translate-menu/entity-translate-menu.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatCardModule } from '@angular/material/card';
import { FormDataService } from '../../../shared/services/form-data.service';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';

@Component({
    selector: 'app-entity-wrapper',
    templateUrl: './entity-wrapper.component.html',
    styleUrls: ['./entity-wrapper.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        FlexModule,
        MatIconModule,
        MatButtonModule,
        SharedComponentsModule,
        CdkDrag,
        CdkDragHandle,
        MatSlideToggleModule,
        EntityTranslateMenuComponent,
        ChangeAnchorTargetDirective,
        FieldsBuilderDirective,
        AsyncPipe,
        TranslateModule,
    ],
})
export class EntityWrapperComponent extends BaseComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('noteTrigger', { read: ElementRef }) private noteTriggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('noteTemplate') private noteTemplateRef?: TemplateRef<undefined>;

  @Input() entityGuid: string;
  @Input() group: UntypedFormGroup;

  collapse = false;
  noteTouched: boolean = false;
  viewModel$: Observable<ContentTypeViewModel>;

  private noteRef?: MatDialogRef<undefined, any>;

  constructor(
    private languageStore: LanguageInstanceService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettingsService: FieldsSettingsService,
    public formConfig: FormConfigService,
    private formDataService: FormDataService,
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
    const language$ = this.languageStore.getLanguage$(this.formConfig.config.formId);
    // const currentLanguage$ = this.languageStore.getCurrentLanguage$(this.formConfig.config.formId);
    // const defaultLanguage$ = this.languageStore.getDefaultLanguage$(this.formConfig.config.formId);
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
    const noteProps$ = combineLatest([note$, language$, itemNotSaved$]).pipe(
      map(([note, lang, itemNotSaved]) => getNoteProps(note, lang, itemNotSaved)),
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

    this.viewModel$ = combineLatest([
      combineLatest([readOnly$, language$, showNotes$, showMetadataFor$]),
      combineLatest([itemForTooltip$, header$, settings$, noteProps$]),
    ]).pipe(
      map(([
        [readOnly, lang, showNotes, showMetadataFor],
        [itemForTooltip, header, settings, noteProps],
      ]) => {
        const viewModel: ContentTypeViewModel = {
          readOnly: readOnly.isReadOnly,
          currentLanguage: lang.current,
          defaultLanguage: lang.primary,
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
        return viewModel;
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

  toggleSlotIsEmpty(oldHeader: ItemIdentifierHeader) {
    const newHeader: ItemIdentifierHeader = {
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
    const language = this.languageStore.getLanguage(this.formConfig.config.formId);
    const title = LocalizationHelpers.translate(language, note.Attributes.Title, null);
    const id = note.Id;
    if (!confirm(this.translate.instant('Data.Delete.Question', { title, id })))
      return;
    this.entityService.delete(eavConstants.contentTypes.notes, note.Id, false).subscribe(() => {
      this.noteRef?.close();
      this.fetchNote();
    });
  }

  private fetchNote() {
    const item = this.itemService.getItem(this.entityGuid);
    if (item.Entity.Id === 0)
      return;

    const editItems: ItemEditIdentifier[] = [{ EntityId: item.Entity.Id }];
    this.formDataService.fetchFormData(JSON.stringify(editItems)).subscribe(formData => {
      const items = formData.Items.map(item1 => EavItem.convert(item1));
      this.itemService.updateItemMetadata(this.entityGuid, items[0].Entity.Metadata);
    });
  }

  private refreshOnChildClosed() {
    this.subscriptions.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchNote();
      })
    );
  }
}
