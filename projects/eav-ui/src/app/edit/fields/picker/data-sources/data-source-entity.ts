import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { classLog } from '../../../../shared/logging/logging';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceEntityQueryBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-query-base';

@Injectable()
export class DataSourceEntity extends DataSourceEntityQueryBase {

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
    var l = this.log.fnIf('getFromBackend', { typeName, guids, fields }, purposeForLog);
    return this.querySvc.getEntities({ contentTypes: [typeName], itemIds: guids, fields, log: this.log.name })
      .pipe(
        // tap(list => l.a('getEntities', { typeName, list })),
        map(list => {
          const fieldMask = this.createMaskHelper();
          const data = list.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true }));
          return { data, loading: false } as DataWithLoading<PickerItem[]>;
        }),
      )
  }

}
