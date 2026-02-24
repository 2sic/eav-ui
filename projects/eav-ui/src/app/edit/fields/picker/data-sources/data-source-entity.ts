import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { classLog } from '../../../../../../../shared/logging';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceEntityBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-base';

@Injectable()
export class DataSourceEntity extends DataSourceEntityBase {

  log = classLog({ DataSourceEntity }, logSpecsDataSourceEntityQueryBase);

  constructor() {
    super();
    this.constructorEnd();
  }

  /**
   * Get the data from the backend using the built-in get-Entities query
   */
  protected override getFromBackend(typeName: string, guids: string[], purposeForLog: string): Observable<DataWithLoading<PickerItem[]>> {
    const fields = this.fieldsToRetrieve(this.settings());

    // Behavior changes a bit if the query is meant to supply data for string-inputs
    // ...mainly because the value is allowed to be any field, not just the Guid.
    const inputSpecs = this.fieldState.config.inputTypeSpecs;
    const valueMustUseGuid = inputSpecs.mustUseGuid;

    var l = this.log.fnIf('getFromBackend', { typeName, guids, fields, inputType: inputSpecs.inputType, valueMustUseGuid }, purposeForLog);
    const fieldMask = this.createMaskHelper();
    const entities = this.querySvc.getEntities({ contentTypes: [typeName], itemIds: guids, fields, log: this.log.name })
      .pipe(
        // tap(list => l.a('getEntities', { typeName, list })),
        map(list => {
          const data = list.Default.map(entity => fieldMask.data2PickerItem({ entity, streamName: null, valueMustUseGuid, valueDefaultsToGuid: true }));
          return { data, loading: false } as DataWithLoading<PickerItem[]>;
        }),
      )
    return l.r(entities);
  }

}
