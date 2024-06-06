import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { DataSourceEntity } from "../data-sources/data-source-entity";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { messagePickerItem } from './picker-source-adapter-base';
import { Injectable } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';

const logThis = false;

@Injectable()
export class PickerEntitySourceAdapter extends PickerSourceEntityAdapterBase {

  constructor(
    public fieldsSettingsService: FieldsSettingsService,
    public entityCacheService: PickerDataCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,
    public snackBar: MatSnackBar,
    private dsEntity: DataSourceEntity,
  ) {
    super(
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      snackBar,
      dsEntity,
      new EavLogger('PickerEntitySourceAdapter', logThis),
    );
  }

  init(callerName: string): void {
    this.log.a('init');
    super.init(callerName);

    this.dsEntity.setup(this.settings$);

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
    this.dsEntity.contentType(this.contentType);
  }

  destroy(): void {
    this.contentTypeMask.destroy();
    super.destroy();
  }

  fetchItems(): void {
    // this.contentType = this.contentTypeMask.resolve();
    this.dsEntity.contentType(this.contentType);
    this.dataSource.getAll();
  }
}