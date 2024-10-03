import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog } from '../../../../shared/logging';
import { DataSourceAppAssets } from '../data-sources/data-source-app-assets';
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase } from "./data-adapter-entity-base";

@Injectable()
export class DataAdapterAppAssets extends DataAdapterEntityBase {
  log = classLog({ DataAdapterAppAssets }, DataAdapterBase.logSpecs);

  protected dataSourceRaw = transient(DataSourceAppAssets);

  constructor() { super();}

  override syncParams(): void {
    this.dataSourceRaw.setParams(this.contentType());
  }

  fetchItems(): void {
    this.syncParams();
    this.dataSource().triggerGetAll();
  }
}
