import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavHeader } from '../../../shared/models/eav';
import { FieldsSettingsService } from '../../../shared/services/fields-settings.service';
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
export class FormCollapsibleComponent implements OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() fieldConfigs: FieldConfigSet[];
  @Input() group: FormGroup;

  collapse = false;
  templateVars$: Observable<FormCollapsibleTemplateVars>;

  private subscription: Subscription;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private contentTypeService: ContentTypeService,
    private itemService: ItemService,
    private router: Router,
    private route: ActivatedRoute,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    this.subscription = new Subscription();
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage(this.config.form.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage(this.config.form.formId);
    const header$ = this.itemService.selectItemHeader(this.config.entity.entityGuid);
    const contentType$ = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    const settingsLogic = new FormCollapsibleLogic();
    const settings$ = settingsLogic.update(this.config.field.settings$, currentLanguage$, defaultLanguage$, header$, contentType$);

    this.subscription.add(
      combineLatest([
        this.languageInstanceService.getCurrentLanguage(this.config.form.formId),
        this.languageInstanceService.getDefaultLanguage(this.config.form.formId),
      ]).subscribe(([currentLanguage, defaultLanguage]) => {
        this.fieldsSettingsService.translateContentTypeSettings(this.config, currentLanguage, defaultLanguage);
      })
    );

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

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
