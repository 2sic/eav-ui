import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavHeader } from '../../../shared/models/eav';
import { EavService, FieldsSettingsService } from '../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { ContentTypeTemplateVars } from './content-type-wrapper.models';

@Component({
  selector: 'app-content-type-wrapper',
  templateUrl: './content-type-wrapper.component.html',
  styleUrls: ['./content-type-wrapper.component.scss'],
})
export class ContentTypeWrapperComponent implements OnInit {
  @Input() entityGuid: string;
  @Input() private entityId: string;
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
  ) { }

  ngOnInit() {
    this.collapse = false;
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    const header$ = this.itemService.getItemHeader$(this.entityGuid);
    const settings$ = this.fieldsSettingsService.getContentTypeSettings$();

    this.templateVars$ = combineLatest([
      currentLanguage$,
      defaultLanguage$,
      header$,
      settings$,
    ]).pipe(
      map(([currentLanguage, defaultLanguage, header, settings]) => {
        const templateVars: ContentTypeTemplateVars = {
          currentLanguage,
          defaultLanguage,
          header,
          itemTitle: settings._itemTitle,
          slotCanBeEmpty: settings._slotCanBeEmpty,
          slotIsEmpty: settings._slotIsEmpty,
          editInstructions: settings.EditInstructions,
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
    this.router.navigate([`versions/${this.entityId}`], { relativeTo: this.route });
  }
}
