import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { EavService, FieldsSettingsService, FieldsTranslateService } from '../../shared/services';
import { ItemService, LanguageInstanceService } from '../../shared/store/ngrx-data';
import { FormValues } from './item-edit-form.models';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  providers: [FieldsSettingsService, FieldsTranslateService],
})
export class ItemEditFormComponent implements OnInit {
  @ViewChild(EavFormComponent) eavFormRef: EavFormComponent;
  @Input() entityGuid: string;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsSettingsService: FieldsSettingsService,
    private fieldsTranslateService: FieldsTranslateService,
  ) { }

  ngOnInit() {
    this.fieldsSettingsService.init(this.entityGuid);
    this.fieldsTranslateService.init(this.entityGuid);
  }

  formValueChange(formValues: FormValues) {
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);
    this.itemService.updateItemAttributesValues(this.entityGuid, formValues, currentLanguage, defaultLanguage);
  }
}
