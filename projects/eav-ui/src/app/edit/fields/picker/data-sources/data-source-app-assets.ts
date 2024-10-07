import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { classLog } from '../../../../shared/logging';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceEntityQueryBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-query-base';

@Injectable()
export class DataSourceAppAssets extends DataSourceEntityQueryBase {

  log = classLog({ DataSourceAppAssets }, logSpecsDataSourceEntityQueryBase, true);

  constructor() {
    super();
    this.constructorEnd();
  }

  /**
  * Get the data from the Query System.AppFiles/Default
  */
  protected override getFromBackend(_typeName: string, _guids: string[], purposeForLog: string): Observable<DataWithLoading<PickerItem[]>> {
    const { AssetsRootFolder: rootFolder, AssetsFileFilter: fileFilter, AssetsType: type } = this.settings();

    var l = this.log.fnIf('getFromBackend', null, purposeForLog);

    var data = this.querySvc.getFromQuery('System.AppFiles/Default', `rootFolder=${rootFolder}&type=${type}&filter=${fileFilter}`, '').pipe(
      map(list => {
        const fieldMask = this.createMaskHelper({ Value: 'Name' });
        const data = list.Default.map(entity => fieldMask.data2PickerItem({ entity, streamName: null, valueMustUseGuid: false }));
        return { data, loading: false } as DataWithLoading<PickerItem[]>;
      })
    );
    return l.r(data);
  }

}
