import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog, ClassLogger } from '../../../../shared/logging';
import { DataSourceAppAssets } from '../data-sources/data-source-app-assets';
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase, logSpecsDataAdapterEntityBase } from "./data-adapter-entity-base";

/**
 * App Assets behave a lot like an entity-source,
 * since the internals are loaded from a query.
 */
@Injectable()
export class DataAdapterAppAssets extends DataAdapterEntityBase {

  log = classLog({DataAdapterAppAssets}, logSpecsDataAdapterEntityBase) as ClassLogger<typeof DataAdapterBase.logSpecs> & ClassLogger<typeof logSpecsDataAdapterEntityBase>;

  protected dataSourceRaw = transient(DataSourceAppAssets);

  constructor() { super(); }

  override syncParams(): void { }

  fetchItems(): void {
    this.syncParams();
    this.dataSource().triggerGetAll();
  }
}
