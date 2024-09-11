import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { Injectable } from '@angular/core';
import { transient } from '../../../../core/transient';
import { DataAdapterBase } from './data-adapter-base';
import { classLog } from '../../../../shared/logging/logging';

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {
  log = classLog({DataAdapterEntity}, DataAdapterBase.logSpecs);

  protected dataSourceRaw = transient(DataSourceEntity);

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dataSourceRaw.setParams(this.contentType());
  }

  fetchItems(): void {
    this.dataSourceRaw.setParams(this.contentType());
    this.dataSource().triggerGetAll();
  }
}
