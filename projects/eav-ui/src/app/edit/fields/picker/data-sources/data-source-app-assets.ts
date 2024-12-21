import { Injectable } from '@angular/core';
import { map, Observable } from "rxjs";
import { classLog } from '../../../../shared/logging';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceEntityBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-base';

@Injectable()
export class DataSourceAppAssets extends DataSourceEntityBase {

  log = classLog({ DataSourceAppAssets }, logSpecsDataSourceEntityQueryBase);

  constructor() {
    super();
    this.constructorEnd();
  }

  /**
  * Get the data from the Query System.AppAssets/Default
  */
  protected override getFromBackend(_typeName: string, _guids: string[], purposeForLog: string): Observable<DataWithLoading<PickerItem[]>> {
    const settings = this.settings();
    const { AssetsRootFolder: rootFolder, AssetsFileFilter: fileFilter, AssetsType: type } = settings;

    const l = this.log.fnIf('getFromBackend', { settings }, purposeForLog);

    const typeLower = (type ?? '').toLocaleLowerCase();
    const stream = typeLower === 'all'
      ? 'Default'
        : typeLower === 'folders'
          ? 'Folders'
          : 'Files';

    
    const fieldMask = this.createMaskHelper({ Value: settings.Value || 'FullName'});

    const data = this.querySvc.getFromQuery(`System.AppAssets/${stream}`, `rootFolder=${rootFolder}&filter=${fileFilter}`, '').pipe(
      map(list => {
        // const fieldMask = this.createMaskHelper({ Value: 'Name' });
        const data = list[stream].map(entity => fieldMask.data2PickerItem({ entity, streamName: stream, valueMustUseGuid: false }));
        return { data, loading: false } as DataWithLoading<PickerItem[]>;
      })
    );
    return l.r(data);
  }

}
