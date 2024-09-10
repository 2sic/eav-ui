import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { Injectable } from '@angular/core';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { transient } from '../../../../core/transient';

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {
  protected dataSourceRaw = transient(DataSourceEntity);

  constructor() {
    super(new EavLogger('DataAdapterEntity'));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dataSourceRaw.setParams(this.contentType());
  }

  fetchItems(): void {
    this.dataSourceRaw.setParams(this.contentType());
    this.dataSource().triggerGetAll();
  }
}
