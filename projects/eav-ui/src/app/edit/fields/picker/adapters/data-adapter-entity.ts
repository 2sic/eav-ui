import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { Injectable } from '@angular/core';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { transient } from '../../../../core/transient';

const logThis = false;

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {
  protected dataSourceEntityOrQuery = transient(DataSourceEntity);

  constructor() {
    super(new EavLogger('PickerEntitySourceAdapter', logThis));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dataSourceEntityOrQuery.setParams(this.contentType());
  }

  fetchItems(): void {
    this.dataSourceEntityOrQuery.setParams(this.contentType());
    this.dataSource().triggerGetAll();
  }
}