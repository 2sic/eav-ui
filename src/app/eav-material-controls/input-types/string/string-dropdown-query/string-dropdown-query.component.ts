import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { EntityDefaultComponent } from '../../entity/entity-default/entity-default.component';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { QueryService } from '../../../../shared/services/query.service';
import { EavService } from '../../../../shared/services/eav.service';
import { EntityDefaultMainSearchComponent } from '../../entity/entity-default-main-search/entity-default-main-search.component';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.scss']
})
@InputType({
  // wrapper: [],
})
export class StringDropdownQueryComponent implements Field, OnInit, OnDestroy {
  @ViewChild(EntityDefaultMainSearchComponent) entityDefaultMainSearchComponent;

  @Input() config: FieldConfig;
  @Input() group: FormGroup;

  availableEntities: EntityInfo[] = [];
  error = '';

  // private eavConfig: EavConfiguration;
  // TODO:
  // get enableTextEntry() { return this.config.settings.EnableTextEntry || false; }

  get freeTextMode() { return this.entityDefaultMainSearchComponent.freeTextMode || false; }

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

  constructor(
    private eavService: EavService,
    private queryService: QueryService,
    private translate: TranslateService) {
    // this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  freeTextModeChange(event: any) {
    this.entityDefaultMainSearchComponent.freeTextModeChange(event);
  }

  callAvailableEntities(value) {
    this.getAvailableEntities();
  }

  // ajax call to get the entities
  getAvailableEntities() {
    if (!this.query) {
      alert(`No query defined for ${this.config.name} - can't load entities`);
    }
    const params = ''; // paramsMask.resolve(); // always get the latest definition
    let queryUrl = this.query;
    if (queryUrl.indexOf('/') === -1) { // append stream name if not defined
      queryUrl = queryUrl + '/' + this.streamName;
    }
    try {
      this.queryService.getAvailableEntities(queryUrl, true, params, true).subscribe(data => {
        if (!data) {
          this.error = this.translate.instant('FieldType.EntityQuery.QueryError');
        } else if (!data[this.streamName]) {
          this.error = this.translate.instant('FieldType.EntityQuery.QueryStreamNotFound') + this.streamName;
        } else { // everything ok - set data to select

          this.config.availableEntities = data[this.streamName].map(this.queryEntityMapping);
        }
        // $scope.indicateReload = false;
      });
    } catch (error) {
      console.error(error);
      // this.selectEntities = [];
      console.error(`${this.translate.instant('FieldType.EntityQuery.QueryError')} - ${error.data}`);
      throw error;
    }
  }

  // queryEntityMapping = (entity) => {
  //   return { Value: entity.Guid, Text: entity.Title, Id: entity.Id };
  // }

  queryEntityMapping = (entity) => {
    return { Value: entity[this.value], Text: entity[this.label], Id: entity.Id };
  }
}
