import { PickerItem, FieldSettings } from "projects/edit-types";
import { Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, of, shareReplay, startWith } from "rxjs";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { messagePickerItem, placeholderPickerItem } from '../adapters/data-adapter-base';
import { Injectable, Signal } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { DataWithLoading } from '../models/data-with-loading';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;
const logRx = true;

@Injectable()
export class DataSourceQuery extends DataSourceBase {
  private params$ = new Subject<string>();

  constructor(
    private queryService: QueryService,
    private entityCacheService: PickerDataCacheService,
    private translate: TranslateService,
  ) {
    super(new EavLogger('DataSourceQuery', logThis));
  }

  private appId: number;

  setupQuery(
    settings: Signal<FieldSettings>,
    isForStringField: boolean,
    entityGuid: string,
    fieldName: string,
    appId: string
  ): void {
    this.log.a('setupQuery', ['settings()', settings(), 'appId', appId, 'isForStringField', isForStringField, 'entityGuid', entityGuid, 'fieldName', fieldName]);

    this.appId = Number(appId);
    super.setup(settings);
    //const settings = settings$.value;
    const sett = settings();
    const streamName = sett.StreamName;
    
    // If the configuration isn't complete, the query can be empty
    const queryName = sett.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? sett.Query : `${sett.Query}/${streamName}`
      : null;

    const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

    const lAll = this.log.rxTap('all$', { enabled: logRx });
    const all$ = combineLatest([
      params$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll))
    ]).pipe(
      lAll.pipe(),
      mergeMap(([params, _]) => {
        // If we don't have a query URL return a single item with a message
        if (!queryUrl)
          return of<DataWithLoading<QueryStreams>>({
              data: {
                'Default': [
                  {
                    Id: -1,
                    Guid: null,
                    Title: this.translate.instant('Fields.Picker.QueryNotConfigured'),
                  },
                ],
              },
              loading: true,
            }
          );

        // Default case, get the data
        const lGetQs = this.log.rxTap('queryService', { enabled: logRx });
        return this.queryService
          .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings()), [])
          .pipe(
            lGetQs.pipe(),
            map(data => { return { data, loading: false }; }),
            startWith({ data: {} as QueryStreams, loading: true })
          );
      }),
      lAll.map('before'),
      map(set => { return { ...set, data: this.transformData(set.data, streamName, /* mustUseGuid: */ !isForStringField) } }),
      lAll.map('after'),
      startWith(this.noItemsLoadingFalse),
      shareReplay(1),
      lAll.shareReplay(),
    );

    // Figure out the prefetch
    // Note that if we're using a string-data based query, there will be no prefetch
    // So it just needs to return an empty list
    const prefetch$ = isForStringField
      ? of([] as PickerItem[])
      : this.prefetchEntityGuids$.pipe(
          distinctUntilChanged(),
          filter(entityGuids => entityGuids?.length > 0),
          mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
          map(entities => entities as PickerItem[]),
          startWith([] as PickerItem[]),
          shareReplay(1),
        );

    let missingInPrefetch$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.value === guid))),
    );

    let combinedGuids$ = combineLatest([missingInPrefetch$, this.guidsToRefresh$]).pipe(
      map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(RxHelpers.distinct)),
      filter(guids => guids?.length > 0),
      // distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    const overrides$ = combineLatest([params$, combinedGuids$]).pipe(
      mergeMap(([params, guids]) => this.queryService
        .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings()), guids)
        .pipe(
          map(data => { return { data, loading: false }; }),
          startWith({ data: {} as QueryStreams, loading: true })
        )
      ),
      map(set => { return { ...set, data: this.transformData(set.data, streamName, /* valueMustBeGuid: */ !isForStringField) } }),
      startWith(this.noItemsLoadingFalse),
      shareReplay(1),
    );

    this.loading$ = combineLatest([all$, overrides$]).pipe(
      map(([all, overrides]) => all.loading || overrides.loading),
    );

    const lData = this.log.rxTap('data$', { enabled: true });
    this.data$ = combineLatest([all$, overrides$, prefetch$]).pipe(
      lData.pipe(),
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all.data, ...overrides.data].map(item => [item.value, item])).values()];
        return data;
      }),
      shareReplay(1),
    );
  }

  destroy(): void {
    this.params$.complete();
    super.destroy();
  }

  params(params: string): void {
    this.params$.next(params);
  }

  transformData(data: QueryStreams, streamName: string | null, valueMustBeGuid: boolean): PickerItem[] {
    this.log.a('transformData', ['data', data, 'streamName', streamName]);
    if (!data)
      return [messagePickerItem(this.translate, 'Fields.Picker.QueryErrorNoData')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => { 
      if (!data[stream]) {
        errors.push(placeholderPickerItem(this.translate, 'Fields.Picker.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }
        
      items = items.concat(data[stream].map(entity => this.getMaskHelper().entity2PickerItem({ entity, streamName: stream, mustUseGuid: valueMustBeGuid })));
    });
    return [...errors, ...this.setDisableEdit(items)];
  }

  private setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const appId = e.data?.AppId;
        e.noEdit = appId != null && appId !== this.appId;
        e.noDelete = e.noEdit;
      });
    return queryEntities;
  }
}