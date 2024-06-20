import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

const logThis = false;

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {

  constructor(private dsEntity: DataSourceEntity) {
    super(dsEntity, new EavLogger('PickerEntitySourceAdapter', logThis));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dsEntity.contentType(this.contentType());
  }

  fetchItems(): void {
    this.dsEntity.contentType(this.contentType());
    this.dataSource().triggerGetAll();
  }
}