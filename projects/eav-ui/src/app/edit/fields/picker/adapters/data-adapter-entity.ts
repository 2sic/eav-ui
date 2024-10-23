import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog, ClassLogger } from '../../../../shared/logging';
import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase, logSpecsDataAdapterEntityBase } from "./data-adapter-entity-base";

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {

  log = classLog({DataAdapterEntity}, logSpecsDataAdapterEntityBase, true) as ClassLogger<typeof DataAdapterBase.logSpecs> & ClassLogger<typeof logSpecsDataAdapterEntityBase>;

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
