import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { EntityDefaultMainSearchComponent } from '../../entity/entity-default-main-search/entity-default-main-search.component';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.scss']
})
@InputType({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements Field, OnInit, OnDestroy {
  @ViewChild(EntityDefaultMainSearchComponent) entityDefaultMainSearchComponent;

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  get label() { return this.config.settings.Label || ''; }

  get value() { return this.config.settings.Value || ''; }

  // constructor() {
  // }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  callAvailableEntities(value) {
    this.getAvailableEntities();
  }

  queryEntityMapping = (entity) => {
    return { Value: entity[this.value], Text: entity[this.label], Id: entity.Id };
  }
}
