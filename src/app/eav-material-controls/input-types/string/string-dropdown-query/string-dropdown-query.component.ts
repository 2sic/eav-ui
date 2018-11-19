import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { EntityDefaultComponent } from '../../entity/entity-default/entity-default.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.scss']
})
export class StringDropdownQueryComponent implements Field, OnInit, OnDestroy {
  @ViewChild(EntityDefaultComponent) entityDefaultComponent;

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  // TODO:
  // get enableTextEntry() { return this.config.settings.EnableTextEntry || false; }

  get freeTextMode() { return this.entityDefaultComponent.freeTextMode || false; }

  get label() { return this.config.settings.Label || ''; }

  get value() { return this.config.settings.Value || ''; }

  get query() { return this.config.settings.Query || ''; }

  get streamName() { return this.config.settings.StreamName || 'Default'; }

  get separator() { return this.config.settings.Separator || ','; }

  get urlParameters() { return this.config.settings.UrlParameters || ''; }

  get allowMultiValue() { return this.config.settings.UrlParameters || true; }

  // AllowMultiValue: true
  // EnableTextEntry: true
  // GroupAdvanced: null
  // GroupMultiSelect: null
  // Id: 4586
  // Label: "Value"
  // Query: "CarListQuery"
  // Separator: ","
  // StreamName: "Default"
  // Title: "CarListQuery"
  // UrlParameters: ""
  // Value: "Name"

  ngOnInit() {

  }

  ngOnDestroy(): void {
  }

  freeTextModeChange(event: any) {
    this.entityDefaultComponent.freeTextModeChange(event);
  }
}
