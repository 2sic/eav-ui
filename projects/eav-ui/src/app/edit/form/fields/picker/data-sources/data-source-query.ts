import { EntityForPicker, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, of, shareReplay, startWith, tap } from "rxjs";
import { PickerDataCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity, QueryStreams } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { placeholderPickerItem } from '../adapters/picker-source-adapter-base';
import { Injectable } from '@angular/core';

const logThis = false;

@Injectable()
export class DataSourceQuery extends DataSourceBase {
  private params$ = new Subject<string>();

  constructor(
    private queryService: QueryService,
    private entityCacheService: PickerDataCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translate: TranslateService,
  ) {
    super(new EavLogger('DataSourceQuery', logThis));
  }

  // private isStringQuery: boolean;
  // private entityGuid: string;
  // private fieldName: string;
  private appId: string;

  setupQuery(
    settings$: BehaviorSubject<FieldSettings>,
    isStringQuery: boolean,
    entityGuid: string,
    fieldName: string,
    appId: string
  ): void {
    this.log.add('setupQuery', 'settings$', settings$, 'appId', appId, 'isStringQuery', isStringQuery, 'entityGuid', entityGuid, 'fieldName', fieldName);

    this.appId = appId;
    super.setup(settings$);
    const settings = settings$.value;
    const streamName = settings.StreamName;
    
    // If the configuration isn't complete, the query can be empty
    const queryName = settings.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? settings.Query : `${settings.Query}/${streamName}`
      : null;

    const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

    const lAll = this.log.rxTap('all$', { enabled: true });
    const all$ = combineLatest([
      params$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll))
    ]).pipe(
      lAll.pipe(),
      mergeMap(([params, _]) => {
        // If we don't have a query URL return a single item with a message
        if (!queryUrl)
          return of({ data: {
            'Default': [
              {
                Id: -1,
                Text: this.translate.instant('Fields.EntityQuery.QueryNotConfigured'),
                Guid: null,
              }
            ] as QueryEntity[],
          } as QueryStreams, loading: true });

        // Default case, get the data
        const lGetQs = this.log.rxTap('queryService', { enabled: true });
        return this.queryService
          .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings$.value), [])
          .pipe(
            lGetQs.pipe(),
            map(data => { return { data, loading: false }; }),
            startWith({ data: {} as QueryStreams, loading: true })
          );
      }),
      lAll.map('before'),
      map(set => { return { ...set, data: this.transformData(set.data, streamName, /* mustUseGuid: */ !isStringQuery) } }),
      lAll.map('after'),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
      lAll.shareReplay(),
    );

    const prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => {
        if (isStringQuery) {
          return this.stringQueryCacheService.getEntities$(entityGuid, fieldName);
        } else {
          return this.entityCacheService.getEntities$(entityGuids);
        }
      }),
      map(entities => {
        if (isStringQuery) {
          return entities.map(entity => this.entity2PickerItem(entity as QueryEntity, null, /* mustUseGuid: */ !isStringQuery));
        } else {
          return entities as PickerItem[];
        }
      }),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    let missingInPrefetch$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    let combinedGuids$ = combineLatest([missingInPrefetch$, this.guidsToRefresh$]).pipe(
      map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      // distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    const overrides$ = combineLatest([params$, combinedGuids$]).pipe(
      mergeMap(([params, guids]) => this.queryService
        .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings$.value), guids)
        .pipe(
          map(data => { return { data, loading: false }; }),
          startWith({ data: {} as QueryStreams, loading: true })
        )
      ),
      map(set => { return { ...set, data: this.transformData(set.data, streamName, /* mustUseGuid: */ !isStringQuery) } }),
      startWith({ data: [] as PickerItem[], loading: false }),
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
        const data = [...new Map([...prefetch, ...all.data, ...overrides.data].map(item => [item.Value, item])).values()];
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

  transformData(data: QueryStreams, streamName: string | null, mustUseGuid: boolean): PickerItem[] {
    this.log.add('transformData', 'data', data, 'streamName', streamName);
    if (!data)
      return [placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryError')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => { 
      if (!data[stream]) {
        errors.push(placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }
        
      items = items.concat(data[stream].map(entity => this.entity2PickerItem(entity, stream, mustUseGuid)));
    });
    return [...errors, ...this.setDisableEdit(items)];
  }

  private setDisableEdit<T extends EntityForPicker>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const disable = e.AppId != null && e.AppId.toString() !== this.appId;
        e._disableEdit = disable;
        e._disableDelete = disable;
      });
    // console.log('2dm queryEntities', queryEntities, this.eavService.eavConfig.appId);
    return queryEntities;
  }
}