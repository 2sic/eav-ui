import { PickerItem } from "projects/edit-types";
import { map } from "rxjs";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';
import { DataWithLoading } from '../models/data-with-loading';

const logThis = true;
const nameOfThis = 'DataSourceEntity';

@Injectable()
export class DataSourceEntity extends DataSourceEntityQueryBase {

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  public override getFromBackend(typeName: string, guids: string[], purposeForLog: string) {
    var l = this.log.fn('getFromBackend', { typeName, guids }, purposeForLog);
    const fieldMask = this.getMaskHelper();
    const logOverrides = this.log.rxTap('overrides$', { enabled: true });
    return this.querySvc.getEntities({
      contentTypes: [typeName],
      itemIds: guids,
      fields: this.fieldsToRetrieve(this.settings()),
      log: logOverrides.name,
    }).pipe(
        map(data => {
          const items = data.Default.map(entity => fieldMask.entity2PickerItem({
            entity,
            streamName: null,
            mustUseGuid: true
          }));
          return { data: items, loading: false } as DataWithLoading<PickerItem[]>;
        }),
      )
  }

}