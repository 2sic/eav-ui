import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EavService } from '../../../shared/services/eav.service';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { BaseComponent } from '../../input-types/base/base.component';
import { ValidationMessagesService } from '../../validators/validation-messages-service';

@Component({
  selector: 'app-collapsible-field-wrapper',
  templateUrl: './collapsible-field-wrapper.component.html',
  styleUrls: ['./collapsible-field-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollapsibleFieldWrapperComponent extends BaseComponent<string[]> implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  collapse = true;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
