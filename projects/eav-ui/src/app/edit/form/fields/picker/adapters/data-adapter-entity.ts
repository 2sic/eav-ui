import { combineLatest } from "rxjs";
import { DataSourceEntity } from "../data-sources/data-source-entity";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { messagePickerItem } from './data-adapter-base';
import { Injectable } from '@angular/core';

const logThis = false;

@Injectable()
export class DataAdapterEntity extends DataAdapterEntityBase {

  constructor(private dsEntity: DataSourceEntity) {
    super(
      dsEntity,
      new EavLogger('PickerEntitySourceAdapter', logThis),
    );
  }

  init(callerName: string): void {
    this.log.a('init');
    super.init(callerName);

    this.subscriptions.add(combineLatest([
      this.dataSource.data$,
      this.dataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe(([data, loading, deleted]) => {
      const items = data.filter(item => !deleted.some(guid => guid === item.value));
      this.optionsOrHints$.next(loading
        ? [messagePickerItem(this.translate, 'Fields.Picker.Loading'), ...items]
        : items
      );
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dsEntity.contentType(this.contentType());
  }

  fetchItems(): void {
    // this.contentType = this.contentTypeMask.resolve();
    this.dsEntity.contentType(this.contentType());
    this.dataSource.triggerGetAll();
  }
}