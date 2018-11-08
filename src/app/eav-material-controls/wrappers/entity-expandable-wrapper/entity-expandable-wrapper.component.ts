import { Component, OnInit, ViewContainerRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { trigger, state, transition, animate, style, keyframes } from '@angular/animations';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { EntityInfo } from '../../../shared/models/eav/entity-info';
import { EntityDefaultComponent } from '../../input-types';
import { EntityService } from '../../../shared/services/entity.service';
import { EavConfiguration } from '../../../shared/models/eav-configuration';
import { EavService } from '../../../shared/services/eav.service';

@Component({
  selector: 'app-entity-expandable-wrapper',
  templateUrl: './entity-expandable-wrapper.component.html',
  styleUrls: ['./entity-expandable-wrapper.component.scss'],
  animations: [
    trigger('itemShrinkAnimation', [
      state('open', style({
        height: '30vh'
      })),
      state('closed', style({
        height: '0vh'
      })),
      transition('open => closed', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
    trigger('contentExpandAnimation', [
      state('closed', style({
        height: '0',
      })),
      state('expanded', style({
        height: 'calc(100vh - 120px)',
        'max-height': 'calc(100vh - 120px)',
      })),
      transition('closed => expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', keyframes([
          style({ 'height': '0vh', overflow: 'hidden' }),
          style({ 'height': 'calc(100vh - 120px)', overflow: 'hidden' }),
        ])),
      ]),
    ]),
  ],
})

export class EntityExpandableWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  get value() {
    return this.group.controls[this.config.name].value;
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

  private entityTextDefault = 'Item not found'; // $translate.instant("FieldType.Entity.EntityNotFound");
  private eavConfig: EavConfiguration;
  private availableEntities: EntityInfo[] = [];

  constructor(private validationMessagesService: ValidationMessagesService,
    private entityService: EntityService,
    private eavService: EavService) {
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
    const ctName = this.entityType;

    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    let itemFilter = null;
    try {
      itemFilter = this.enableAddExisting
        ? null
        : this.group.controls[this.config.name].value;
    } catch (err) { }

    this.entityService.getAvailableEntities(this.eavConfig.appId, itemFilter, ctName).subscribe(items => {
      this.availableEntities = [...items];
    });
  }

}
