import { Injectable } from '@angular/core';
import { transient } from '../../../../core/transient';
import { classLog } from '../../../../shared/logging/logging';
import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase } from "./data-adapter-entity-base";

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {
  log = classLog({DataAdapterEntity}, DataAdapterBase.logSpecs);

  protected dataSourceRaw = transient(DataSourceEntity);

  constructor() { super(); }

  override syncParams(): void {
    this.dataSourceRaw.setParams(this.contentType());
  }

  fetchItems(): void {
    this.syncParams();
    this.dataSource().triggerGetAll();
  }
}
