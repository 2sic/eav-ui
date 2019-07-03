import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { EntityFieldConfigSet } from '../../../../shared/models/entity/entity-field-config-set';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { QueryService } from '../../../../shared/services/query.service';
import { EntityDefaultMainSearchComponent } from '../../entity/entity-default-main-search/entity-default-main-search.component';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldMaskService } from '../../../../../../projects/shared/field-mask.service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-query',
  templateUrl: './entity-query.component.html',
  styleUrls: ['./entity-query.component.scss']
})
@InputType({})
export class EntityQueryComponent implements Field, OnInit, OnDestroy {

  @Input() config: EntityFieldConfigSet;
  @Input() group: FormGroup;

  availableEntities: EntityInfo[] = [];
  error = '';
  private fieldMaskService: FieldMaskService;

  get query() { return this.config.field.settings.Query || ''; }

  get streamName() { return this.config.field.settings.StreamName || 'Default'; }

  get urlParameters() { return this.config.field.settings.UrlParameters || ''; }

  constructor(
    private queryService: QueryService,
    private translate: TranslateService) {
  }

  ngOnInit() {
    // Initialize url parameters mask
    // this will contain the auto-resolve url parameters
    this.fieldMaskService = new FieldMaskService(this.urlParameters, this.group.controls, null, null);

    // get all mask field and subcribe to changes. On every change getAvailableEntities.
    this.subscribeToMaskFieldsChanges();
  }

  ngOnDestroy(): void {
  }

  callAvailableEntities(value) {
    this.getAvailableEntities();
  }

  // ajax call to get the entities
  getAvailableEntities() {
    if (!this.query) {
      alert(`No query defined for ${this.config.field.name} - can't load entities`);
    }

    const params = this.fieldMaskService.resolve(); // always get the latest definition
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
          this.config.cache = data[this.streamName].map(this.queryEntityMapping);
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

  queryEntityMapping = (entity) => {
    return { Value: entity.Guid, Text: entity.Title, Id: entity.Id };
  }

  /**
  *  get all mask field and subcribe to changes. On every change getAvailableEntities.
  */
  private subscribeToMaskFieldsChanges() {
    this.fieldMaskService.fieldList().forEach((e, i) => {
      if (this.group.controls[e]) {
        this.group.controls[e].valueChanges.subscribe((item) => {
          this.getAvailableEntities();
        });
      }
    });
  }
}
