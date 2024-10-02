import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { classLog } from '../../../../shared/logging/logging';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceEntityQueryBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-query-base';

@Injectable()
export class DataSourceAppAssets extends DataSourceEntityQueryBase {

  log = classLog({ DataSourceAppAssets }, logSpecsDataSourceEntityQueryBase);




  /**
  * Get the data from the Query System.AppFiles/Default
  */
  protected override getFromBackend(_typeName: string, _guids: string[], purposeForLog: string): Observable<DataWithLoading<PickerItem[]>> {
    const { AppAssetsRootFolder: rootFolder, AppAssetsFileFilter: fileFilter, AppAssetsType: type } = this.settings();

    var l = this.log.fnIf('getFromBackend', { _typeName, _guids }, purposeForLog);

    return this.querySvc.getFromQuery('System.AppFiles/Default', `rootFolder=${rootFolder}&type=${type}&filter=${fileFilter}`, '').pipe(
      map(list => {
        const fieldMask = this.createMaskHelper({ Value: '[Item:Name]' });

        fieldMask.patchMasks({ value: 'Name' })

        console.log('2dg fieldMask', fieldMask);


        const data = list.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true }));
        return { data, loading: false } as DataWithLoading<PickerItem[]>;
      })
    )
  }

}
