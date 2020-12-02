import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavHeader } from '../../../shared/models/eav';
import { ContentTypeService } from '../../../shared/store/ngrx-data/content-type.service';
import { ItemService } from '../../../shared/store/ngrx-data/item.service';
import { LanguageInstanceService } from '../../../shared/store/ngrx-data/language-instance.service';
import { FieldConfigSet } from '../../model/field-config';
import { FormCollapsibleLogic } from './form-collapsible-logic';
import { FormCollapsibleTemplateVars } from './form-collapsible.models';

@Component({
  selector: 'app-form-collapsible',
  templateUrl: './form-collapsible.component.html',
  styleUrls: ['./form-collapsible.component.scss'],
})
export class FormCollapsibleComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() fieldConfigs: FieldConfigSet[];
  @Input() group: FormGroup;

  collapse = false;
  templateVars$: Observable<FormCollapsibleTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    const header$ = this.itemService.selectItemHeader(this.config.entity.entityGuid);
    const contentType$ = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    const settingsLogic = new FormCollapsibleLogic();
    const settings$ = settingsLogic.update(this.config.field.settings$, currentLanguage$, defaultLanguage$, header$, contentType$);

    this.templateVars$ = combineLatest([
      currentLanguage$,
      defaultLanguage$,
      header$,
      settings$,
    ]).pipe(
      map(([currentLanguage, defaultLanguage, header, settings]) => {
        const templateVars: FormCollapsibleTemplateVars = {
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
