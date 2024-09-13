import { map } from "rxjs";
import { Injectable } from '@angular/core';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { classLog } from '../../../../shared/logging/logging';

@Injectable()
export class DataSourceEntity extends DataSourceEntityQueryBase {

  log = classLog({DataSourceEntity}, DataSourceEntityQueryBase.logSpecs);

  constructor() { super(); this.constructorEnd(); }

  public override getFromBackend(typeName: string, guids: string[], purposeForLog: string) {
    const fields = this.fieldsToRetrieve(this.settings());
    var l = this.log.fnIf('getFromBackend', { typeName, guids, fields }, purposeForLog);
    return this.querySvc.getEntities({ contentTypes: [typeName], itemIds: guids, fields, log: this.log.name })
      .pipe(
        map(list => {
          const fieldMask = this.getMaskHelper();
          const data = list.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true }));
          return { data, loading: false } as DataWithLoading<PickerItem[]>;
        }),
      )
  }

}
