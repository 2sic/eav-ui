
import { FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy, Input, ViewChild, AfterViewInit } from '@angular/core';

import { EntityDefaultComponent } from '../entity-default/entity-default.component';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { EntityDefaultMainSearchComponent } from '../entity-default-main-search/entity-default-main-search.component';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-content-blocks',
  templateUrl: './entity-content-blocks.component.html',
  styleUrls: ['./entity-content-blocks.component.scss']
})
export class EntityContentBlockComponent extends EntityDefaultComponent implements Field, OnInit, OnDestroy {
  @ViewChild(EntityDefaultMainSearchComponent) entityDefaultMainSearchComponent;

  @Input() config: FieldConfigSet;
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

  ngOnDestroy(): void {
  }

  callAvailableEntities(value) {
    this.getAvailableEntities();
  }
}
