import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { PickerItem } from "projects/edit-types";
import { Observable, combineLatest } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { EntityFieldDataSource } from "../data-sources/entity-field-data-source";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { placeholderPickerItem } from './picker-source-adapter-base';
import { Injectable } from '@angular/core';

const logThis = false;

@Injectable()
export class PickerEntitySourceAdapter extends PickerSourceEntityAdapterBase {
  private entityFieldDataSource: EntityFieldDataSource;

  constructor(
    public fieldsSettingsService: FieldsSettingsService,
    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    public snackBar: MatSnackBar,
  ) {
    super(
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      snackBar,
      new EavLogger('PickerEntitySourceAdapter', logThis),
    );
  }

  init(callerName: string): void {
    this.log.add('init');
    super.init(callerName);

    this.entityFieldDataSource = this.fieldDataSourceFactoryService.createEntityFieldDataSource(this.settings$);

    this.subscriptions.add(combineLatest([
      this.entityFieldDataSource.data$,
      this.entityFieldDataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe(([data, loading, deleted]) => {
      const items = data.filter(item => !deleted.some(guid => guid === item.Value));
      if (loading) {
        this.availableItems$.next([placeholderPickerItem(this.translate, 'Fields.Entity.Loading'), ...items]);
      } else {
        this.availableItems$.next(items);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.entityFieldDataSource.contentType(this.contentType);
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.entityFieldDataSource.data$;
  }

  setPrefetchData(missingData: string[]): void {
    this.entityFieldDataSource.prefetchEntityGuids(missingData);
  }

  forceReloadData(missingData: string[]): void {
    this.entityFieldDataSource.forceLoadGuids(missingData);
  }

  destroy(): void {
    this.contentTypeMask.destroy();
    this.entityFieldDataSource.destroy();

    super.destroy();
  }

  fetchItems(): void {
    this.contentType = this.contentTypeMask.resolve();
    this.entityFieldDataSource.contentType(this.contentType);
    this.entityFieldDataSource.getAll();
  }
}