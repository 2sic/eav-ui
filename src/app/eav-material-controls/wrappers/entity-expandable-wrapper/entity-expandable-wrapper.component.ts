import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { EntityInfo } from '../../../shared/models/eav/entity-info';
import { EntityDefaultComponent } from '../../input-types';
import { EntityService } from '../../../shared/services/entity.service';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
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

export class EntityExpandableWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  dialogIsOpen = false;

  get value() {
    return Helper.convertValueToArray(this.group.controls[this.config.name].value, this.separator);
  }

  get id() {
    return `${this.config.entityId}${this.config.index}`;
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get enableAddExisting() {
    return this.config.settings.EnableAddExisting || false;
  }

  get entityType() {
    return this.config.settings.EntityType || '';
  }

  get separator() { return this.config.settings.Separator || ','; }

  private entityTextDefault = this.translate.instant('FieldType.Entity.EntityNotFound');
  private eavConfig: EavConfiguration;
  availableEntities: EntityInfo[] = [];

  constructor(private validationMessagesService: ValidationMessagesService,
    private entityService: EntityService,
    private eavService: EavService,
    private translate: TranslateService) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.setAvailableEntities();
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


  /**
   *  // TODO: same method in entity - !!!
   * TODO: select all entities from app
   *
   */
  private setAvailableEntities() {
    // TODO:
    // const ctName = this.contentType.resolve(); // always get the latest definition, possibly from another drop-down
    // TEMP: harcoded
    const ctName = this.entityType || 'QueryCarList';

    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.value;
    } catch (err) { }

    this.entityService.getAvailableEntities(this.eavConfig.appId, itemFilter, ctName).subscribe(items => {
      this.availableEntities = [...items];
    });
  }

}
