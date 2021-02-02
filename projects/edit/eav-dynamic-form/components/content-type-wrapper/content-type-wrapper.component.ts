import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavHeader } from '../../../shared/models/eav';
import { FieldsSettings2Service } from '../../../shared/services/fields-settings2.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { FieldConfigSet } from '../../model/field-config';
import { ContentTypeTemplateVars } from './content-type-wrapper.models';

@Component({
  selector: 'app-content-type-wrapper',
  templateUrl: './content-type-wrapper.component.html',
  styleUrls: ['./content-type-wrapper.component.scss'],
})
export class ContentTypeWrapperComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() fieldConfigs: FieldConfigSet[];
  @Input() group: FormGroup;

  collapse = false;
  templateVars$: Observable<ContentTypeTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettings2Service: FieldsSettings2Service,
  ) { }

  ngOnInit() {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    const header$ = this.itemService.selectItemHeader(this.config.entity.entityGuid);
    const settings$ = this.fieldsSettings2Service.getContentTypeSettings$();

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
    this.itemService.updateItemHeader(this.config.entity.entityGuid, newHeader);
  }

  openHistory() {
    this.router.navigate([`versions/${this.config.entity.entityId}`], { relativeTo: this.route });
  }
}
