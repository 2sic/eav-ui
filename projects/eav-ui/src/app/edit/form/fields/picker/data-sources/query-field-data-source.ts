import { EntityForPicker, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, of, shareReplay, startWith, tap } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity, QueryStreams } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { placeholderPickerItem } from '../adapters/picker-source-adapter-base';
import { Injectable } from '@angular/core';

const logThis = true;

@Injectable()
export class QueryFieldDataSource extends DataSourceBase {
  private params$ = new Subject<string>();

  constructor(
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translate: TranslateService,
  ) {
    super(new EavLogger('QueryFieldDataSource', logThis));
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
    this.log.add('setupQuery', 'settings$', settings$, 'appId', appId);
    // this.isStringQuery = isStringQuery;
    // this.entityGuid = entityGuid;
    // this.fieldName = fieldName;
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

    const all$ = combineLatest([
      params$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll))
    ]).pipe(
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
        return this.queryService
          .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings$.value), [])
          .pipe(
            map(data => { return { data, loading: false }; }),
            startWith({ data: {} as QueryStreams, loading: true })
          );
      }),
      map(set => { return { ...set, data: this.transformData(set.data, streamName) } }),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    const prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => {
        if (/*this.*/isStringQuery) {
          return this.stringQueryCacheService.getEntities$(/*this.*/entityGuid, /* this. */fieldName);
        } else {
          return this.entityCacheService.getEntities$(entityGuids);
        }
      }),
      map(entities => {
        if (/*this. */isStringQuery) {
          return entities.map(entity => this.entity2PickerItem(entity as QueryEntity));
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

    let combinedGuids$ = combineLatest([missingInPrefetch$, this.entityGuids$]).pipe(
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
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
      map(set => { return { ...set, data: this.transformData(set.data, streamName) } }),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    this.loading$ = combineLatest([all$, overrides$]).pipe(
      map(([all, overrides]) => all.loading || overrides.loading),
    );

    this.data$ = combineLatest([all$, overrides$, prefetch$]).pipe(
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

  transformData(data: QueryStreams, streamName: string): PickerItem[] {
    if (!data)
      return [placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryError')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => { 
      if (!data[stream]) {
        errors.push(placeholderPickerItem(this.translate, 'Fields.EntityQuery.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }
        
      items = items.concat(data[stream].map(entity => this.entity2PickerItem(entity, stream)));
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