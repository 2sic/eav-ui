import { map } from "rxjs";
import { Injectable } from '@angular/core';
import { DataSourceEntityQueryBase, LogSpecsDataSourceEntity } from './data-source-entity-query-base';
import { DataWithLoading } from '../models/data-with-loading';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { PickerItem } from '../models/picker-item.model';
import { LogSpecs } from '../../../../shared/logging/log-specs';

const logSpecs: LogSpecs<Partial<LogSpecsDataSourceEntity>> = {
  enabled: true,
  name: 'DataSourceEntity',
  specs: {
    all: true,
    getFromBackend: true,
    
  }
};

@Injectable()
export class DataSourceEntity extends DataSourceEntityQueryBase {

  constructor() {
    super(new EavLogger(logSpecs));
  }

  public override getFromBackend(typeName: string, guids: string[], purposeForLog: string) {
    const fields = this.fieldsToRetrieve(this.settings());
    var l = this.log.fnIf('getFromBackend', { typeName, guids, fields }, purposeForLog);
    return this.querySvc.getEntities({ contentTypes: [typeName], itemIds: guids, fields, log: logSpecs.name })
      .pipe(
        map(list => {
          const fieldMask = this.getMaskHelper();
          const data = list.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true }));
          return { data, loading: false } as DataWithLoading<PickerItem[]>;
        }),
      )
  }

}
