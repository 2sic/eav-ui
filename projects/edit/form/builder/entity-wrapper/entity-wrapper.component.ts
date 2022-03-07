import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { eavConstants } from '../../../../ng-dialogs/src/app/shared/constants/eav.constants';
import { EditForm, EditItem } from '../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavEntity, EavHeader, EavItem } from '../../../shared/models/eav';
import { EavService, EditRoutingService, FieldsSettingsService, FormsStateService } from '../../../shared/services';
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

  @Input() entityGuid: string;
  @Input() group: FormGroup;

  collapse: boolean;
  templateVars$: Observable<ContentTypeTemplateVars>;

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
    const noteProps$ = combineLatest([note$, currentLanguage$, defaultLanguage$]).pipe(
      map(([note, currentLanguage, defaultLanguage]) => getNoteProps(note, currentLanguage, defaultLanguage)),
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

  openNote() {
    this.noteTriggerRef?.openMenu();
  }

  closeNote() {
    this.noteTriggerRef?.closeMenu();
  }

  editNote(note?: EavEntity) {
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
    const item = this.itemService.getItem(this.entityGuid);
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
