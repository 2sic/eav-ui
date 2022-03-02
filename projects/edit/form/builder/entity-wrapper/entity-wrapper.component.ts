import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { MetadataItem } from '../../../../ng-dialogs/src/app/metadata';
import { MetadataService } from '../../../../ng-dialogs/src/app/permissions';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { EditForm } from '../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavHeader } from '../../../shared/models/eav';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { getNoteProps } from './entity-wrapper.helpers';
import { ContentTypeTemplateVars } from './entity-wrapper.models';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
})
export class EntityWrapperComponent implements OnInit, OnDestroy {
  @Input() entityGuid: string;
  @Input() group: FormGroup;

  collapse: boolean;
  templateVars$: Observable<ContentTypeTemplateVars>;

  private subscription: Subscription;
  private note$: BehaviorSubject<MetadataItem>;

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
    private metadataService: MetadataService,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.note$ = new BehaviorSubject<MetadataItem>(undefined);
    this.collapse = false;
    const readOnly$ = this.formsStateService.readOnly$;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const itemForTooltip$ = this.itemService.getItemFor$(this.entityGuid).pipe(
      map(itemFor => {
        if (!itemFor) { return; }
        const tooltip = this.translate.instant('Form.Buttons.Metadata.Tip')
          + `\nTarget: ${itemFor.Target}`
          + `\nTargetType: ${itemFor.TargetType}`
          + (itemFor.Number ? `\nNumber: ${itemFor.Number}` : '')
          + (itemFor.String ? `\nString: ${itemFor.String}` : '')
          + (itemFor.Guid ? `\nGuid: ${itemFor.Guid}` : '')
          + (itemFor.Title ? `\nTitle: ${itemFor.Title}` : '');
        return tooltip;
      }),
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

    this.templateVars$ = combineLatest([
      combineLatest([readOnly$, currentLanguage$, defaultLanguage$]),
      combineLatest([itemForTooltip$, header$, settings$, this.note$]),
    ]).pipe(
      map(([
        [readOnly, currentLanguage, defaultLanguage],
        [itemForTooltip, header, settings, note],
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
          note,
          noteProps: getNoteProps(note),
        };
        return templateVars;
      }),
    );

    this.fetchNote();
    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.note$.complete();
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

  editNote(note?: MetadataItem) {
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

  private fetchNote() {
    this.metadataService.getMetadata(
      eavConstants.metadata.entity.targetType, eavConstants.metadata.entity.keyType, this.entityGuid, eavConstants.contentTypes.notes,
    ).subscribe(metadata => {
      this.note$.next(metadata.Items[0]);
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
