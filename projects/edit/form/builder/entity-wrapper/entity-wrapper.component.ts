import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { GeneralHelpers } from '../../../shared/helpers';
import { EavHeader } from '../../../shared/models/eav';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { ContentTypeTemplateVars } from './entity-wrapper.models';

@Component({
  selector: 'app-entity-wrapper',
  templateUrl: './entity-wrapper.component.html',
  styleUrls: ['./entity-wrapper.component.scss'],
})
export class EntityWrapperComponent implements OnInit {
  @Input() entityGuid: string;
  @Input() group: FormGroup;

  collapse: boolean;
  templateVars$: Observable<ContentTypeTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettingsService: FieldsSettingsService,
    public eavService: EavService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.collapse = false;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const itemForTooltip$ = this.itemService.getItemFor$(this.entityGuid).pipe(
      map(itemFor => {
        if (!itemFor) { return; }
        const tooltip = this.translate.instant('Form.Buttons.Metadata.Tip')
          + `\nType: ${itemFor.Target}`
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

    this.templateVars$ = combineLatest([currentLanguage$, defaultLanguage$, itemForTooltip$, header$, settings$]).pipe(
      map(([currentLanguage, defaultLanguage, itemForTooltip, header, settings]) => {
        const templateVars: ContentTypeTemplateVars = {
          currentLanguage,
          defaultLanguage,
          header,
          itemTitle: settings._itemTitle,
          slotCanBeEmpty: settings._slotCanBeEmpty,
          slotIsEmpty: settings._slotIsEmpty,
          editInstructions: settings.EditInstructions,
          itemForTooltip,
        };
        return templateVars;
      }),
    );
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
}
