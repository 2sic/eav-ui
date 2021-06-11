import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EavFormComponent } from '../../eav-dynamic-form/components/eav-form/eav-form.component';
import { FieldsSettingsService, FieldsTranslateService } from '../../shared/services';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.scss'],
  providers: [FieldsSettingsService, FieldsTranslateService],
})
export class ItemEditFormComponent implements OnInit {
  @ViewChild(EavFormComponent) eavFormRef: EavFormComponent;
  @Input() entityGuid: string;

  constructor(public fieldsSettingsService: FieldsSettingsService, private fieldsTranslateService: FieldsTranslateService) { }

  ngOnInit() {
    this.fieldsSettingsService.init(this.entityGuid);
    this.fieldsTranslateService.init(this.entityGuid);
  }
}
