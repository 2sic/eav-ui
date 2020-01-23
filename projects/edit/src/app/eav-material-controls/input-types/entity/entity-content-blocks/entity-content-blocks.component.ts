
import { FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';

import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { EntityDefaultMainSearchComponent } from '../entity-default-main-search/entity-default-main-search.component';
import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-content-blocks',
  templateUrl: './entity-content-blocks.component.html',
  styleUrls: ['./entity-content-blocks.component.scss']
})
@InputType({})
export class EntityContentBlockComponent extends EntityDefaultComponent implements Field, OnInit, OnDestroy {
  @ViewChild(EntityDefaultMainSearchComponent, { static: false }) entityDefaultMainSearchComponent: EntityDefaultMainSearchComponent;

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;

  ngOnInit() {
    this.config.field.settings.AllowMultiValue = false;
    this.config.field.settings.EnableRemove = true;
    this.config.field.settings.AllowMultiValue = true; // for correct UI showing "remove"
    this.config.field.settings.EnableAddExisting = false; // disable manual select existing
    this.config.field.settings.EnableCreate = false; // disable manual create
    this.config.field.settings.EnableEdit = false;
    this.config.field.settings.EntityType = 'ContentGroupReference';

    // important for calling a FieldMaskService from extended component
    super.ngOnInit();
  }

  ngOnDestroy() {
  }

  callAvailableEntities(event: Event) {
    this.getAvailableEntities();
  }
}
