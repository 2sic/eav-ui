import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService, QueryService } from "../../../../shared/services";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { FieldMask } from "../../../../shared/helpers/field-mask.helper";
import { GeneralHelpers } from "../../../../shared/helpers";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { QueryFieldDataSource } from "../data-sources/query-field-data-source";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { placeholderPickerItem } from './picker-source-adapter-base';
import { Injectable } from '@angular/core';

const logThis = true;

@Injectable()
export class PickerQuerySourceAdapter extends PickerSourceEntityAdapterBase {
  private paramsMask: FieldMask;
  // private queryFieldDataSource: QueryFieldDataSource;

  constructor(
    public fieldsSettingsService: FieldsSettingsService, // DI
    public queryService: QueryService, // DI
    public stringQueryCacheService: StringQueryCacheService, // DI
    public entityCacheService: EntityCacheService, // DI
    public entityService: EntityService, // DI
    public eavService: EavService, // DI
    public editRoutingService: EditRoutingService, // DI
    public translate: TranslateService, // DI
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService, // DI
    public snackBar: MatSnackBar, // DI
    private queryFieldDataSource: QueryFieldDataSource, // DI
  ) {
    super(
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      snackBar,
      new EavLogger('PickerQuerySourceAdapter', logThis),
    );
  }

  private error$: BehaviorSubject<string>;
  private isStringQuery: boolean;

  public setupQuery(
    error$: BehaviorSubject<string>,
    isStringQuery: boolean,
  ): this {

    this.log.add('setupQuery', isStringQuery);
    this.error$ = error$;
    this.isStringQuery = isStringQuery;
    
    return this;
  }

  init(callerName: string): void {
    super.init(callerName);

    this.subscriptions.add(
      this.settings$.pipe(
        map(settings => settings.UrlParameters),
        distinctUntilChanged(),
      ).subscribe(urlParameters => {
        this.paramsMask?.destroy();
        this.paramsMask = new FieldMask(
          urlParameters,
          this.group.controls,
          () => { this.availableItems$.next(null); },
          null,
          this.eavService.eavConfig,
          this.config,
        );

        this.availableItems$.next(null);
      })
    );

    this.log.add('init - isStringQuery', this.isStringQuery);

    this.queryFieldDataSource.setupQuery(
      this.settings$,
      this.isStringQuery,
      this.config.entityGuid,
      this.config.fieldName,
      this.eavService.eavConfig.appId,
    );

    // this.queryFieldDataSource = this.fieldDataSourceFactoryService.createQueryFieldDataSource(
    //   this.settings$,
    //   this.isStringQuery,
    //   this.config.entityGuid,
    //   this.config.fieldName,
    //   this.eavService.eavConfig.appId,
    // );

    this.flushAvailableEntities();

    this.subscriptions.add(combineLatest([
      this.queryFieldDataSource.data$,
      this.queryFieldDataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe({
      next: ([data, loading, deleted]) => {
        const items = data.filter(item => !deleted.some(guid => guid === item.Value));
        if (loading) {
          this.availableItems$.next([placeholderPickerItem(this.translate, 'Fields.Entity.Loading'), ...items]);
        } else {
          this.availableItems$.next(items);
        }
      },
      error: (error) => {
        this.availableItems$.next([placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryError', "-" + error.data)]);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.queryFieldDataSource.params(this.paramsMask.resolve());
  }

  destroy(): void {
    this.paramsMask?.destroy();
    this.error$.complete();
    this.queryFieldDataSource.destroy();
    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.queryFieldDataSource.data$;
  }

  setPrefetchData(missingData: string[]): void {
    this.queryFieldDataSource.prefetchEntityGuids(missingData);
  }

  forceReloadData(missingData: string[]): void {
    this.queryFieldDataSource.forceLoadGuids(missingData);
  }

  fetchItems(): void {
    this.log.add('fetchItems');
    // this.contentType = this.contentTypeMask.resolve();
    // console.warn('2dm content-type', this.contentType);
    // this.entityFieldDataSource.contentType(this.contentType);

    this.queryFieldDataSource.params(this.paramsMask.resolve());
    const settings = this.settings$.value;
    if (!settings.Query) {
      this.availableItems$.next([placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryNotDefined')]);
      return;
    }

    this.queryFieldDataSource.getAll();
  }

  flushAvailableEntities(): void {
    this.log.add('flushAvailableEntities, isStringQuery', this.isStringQuery);
    if (!this.isStringQuery) {
      this.subscriptions.add(
        this.settings$.pipe(
          map(settings => ({
            Query: settings.Query,
            StreamName: settings.StreamName,
          })),
          distinctUntilChanged(GeneralHelpers.objectsEqual),
        ).subscribe(() => {
          this.availableItems$.next(null);
        })
      );
    } else {
      this.subscriptions.add(
        this.settings$.pipe(
          map(settings => ({
            Value: settings.Value,
            Label: settings.Label,
          })),
          distinctUntilChanged(GeneralHelpers.objectsEqual),
        ).subscribe(() => {
          this.availableItems$.next(null);
        })
      );
    }
  }
}