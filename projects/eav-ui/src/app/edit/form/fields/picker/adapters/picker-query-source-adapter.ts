import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService, QueryService } from "../../../../shared/services";
import { FieldMask } from "../../../../shared/helpers/field-mask.helper";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceQuery } from "../data-sources/data-source-query";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { messagePickerItem, placeholderPickerItem } from './picker-source-adapter-base';
import { Injectable } from '@angular/core';
import { PickerComponent } from '../picker.component';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';

const logThis = false;

@Injectable()
export class PickerQuerySourceAdapter extends PickerSourceEntityAdapterBase {
  private paramsMask: FieldMask;

  constructor(
    public fieldsSettingsService: FieldsSettingsService,
    public queryService: QueryService,
    // public stringQueryCacheService: StringQueryCacheService,
    public entityCacheService: PickerDataCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,
    public snackBar: MatSnackBar,
    private dsQuery: DataSourceQuery,
  ) {
    super(
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      snackBar,
      dsQuery,
      new EavLogger('PickerQuerySourceAdapter', logThis),
    );
  }

  private error$: BehaviorSubject<string>;
  private isStringQuery: boolean;

  public /* override */ setupFromComponent(component: PickerComponent, state: PickerStateAdapter): this {
    this.log.add('setupFromComponent');
    super.setupFromComponent(component, state);
    this.isStringQuery = component.isStringQuery;
    return this;
  }


  public setupQuery(
    error$: BehaviorSubject<string>,
  ): this {

    this.log.add('setupQuery');
    this.error$ = error$;
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
          () => { this.optionsOrHints$.next(null); },
          null,
          this.eavService.eavConfig,
          this.config,
        );

        this.optionsOrHints$.next(null);
      })
    );

    this.log.add('init - isStringQuery', this.isStringQuery);

    this.dsQuery.setupQuery(
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
      this.dataSource.data$,
      this.dataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe({
      next: ([data, loading, deleted]) => {
        const items = data.filter(item => !deleted.some(guid => guid === item.value));
        this.optionsOrHints$.next(loading
          ? [messagePickerItem(this.translate, 'Fields.Picker.Loading'), ...items]
          : items
        );
      },
      error: (error) => {
        this.optionsOrHints$.next([messagePickerItem(this.translate, 'Fields.Picker.QueryError', { error: error.data })]);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dsQuery.params(this.paramsMask.resolve());
  }

  destroy(): void {
    this.paramsMask?.destroy();
    this.error$.complete();
    super.destroy();
  }

  fetchItems(): void {
    this.log.add('fetchItems');
    // this.contentType = this.contentTypeMask.resolve();
    // console.warn('2dm content-type', this.contentType);
    // this.entityFieldDataSource.contentType(this.contentType);

    this.dsQuery.params(this.paramsMask.resolve());
    const settings = this.settings$.value;
    if (!settings.Query) {
      this.optionsOrHints$.next([placeholderPickerItem(this.translate, 'Fields.Picker.QueryNotDefined')]);
      return;
    }

    this.dsQuery.getAll();
  }

  /**
   * TODO: it's a bit unclear what this is for.
   * 2024-04-29 2dm I believe it should flush the optionsOrHints$ when the settings change.
   * ...but I'm not quite sure how they would ever change at runtime.
   */
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
          this.optionsOrHints$.next(null);
        })
      );
    } else {
      this.subscriptions.add(
        this.settings$.pipe(
          map(settings => ({
            value: settings.Value,
            label: settings.Label,
          })),
          distinctUntilChanged(GeneralHelpers.objectsEqual),
        ).subscribe(() => {
          this.optionsOrHints$.next(null);
        })
      );
    }
  }
}
