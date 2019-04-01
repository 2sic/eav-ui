import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { EntityFieldConfigSet } from '../../../shared/models/entity/entity-field-config-set';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { EntityInfo } from '../../../shared/models/eav/entity-info';
import { EavService } from '../../../shared/services/eav.service';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { TranslateService } from '@ngx-translate/core';
import { Helper } from '../../../shared/helpers/helper';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation],
})
export class EntityExpandableWrapperComponent implements FieldWrapper, OnInit, AfterViewInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: EntityFieldConfigSet;
  group: FormGroup;

  dialogIsOpen = false;

  get availableEntities(): EntityInfo[] { return this.config.cache || []; }
  get value() { return Helper.convertValueToArray(this.group.controls[this.config.field.name].value, this.separator); }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get enableAddExisting() { return this.config.field.settings.EnableAddExisting || false; }
  get entityType() { return this.config.field.settings.EntityType || ''; }
  get separator() { return this.config.field.settings.Separator || ','; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }

  private entityTextDefault = this.translate.instant('FieldType.Entity.EntityNotFound');

  constructor(private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    // this.setAvailableEntities();
  }

  ngAfterViewInit() {
  }

  // TODO: same method in entity - !!!
  getEntityText = (value): string => {
    if (value === null) {
      return 'empty slot';
    }
    const entities = this.availableEntities.filter(f => f.Value === value);
    if (entities.length > 0) {
      return entities.length > 0 ? entities[0].Text :
        this.entityTextDefault ? this.entityTextDefault : value;
    }
    return value;
  }
}
