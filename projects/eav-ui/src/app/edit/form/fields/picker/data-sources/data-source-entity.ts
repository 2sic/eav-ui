import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from "rxjs";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { QueryService } from "../../../../shared/services";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

const logThis = false;
const logChildren = false;

@Injectable()
export class DataSourceEntity extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();

  constructor(
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
  ) {
    super(new EavLogger('DataSourceEntity', logThis, logChildren));
  }

  setup(settings$: BehaviorSubject<FieldSettings>): void {
    this.log.add('setup', 'settings$', settings$);
    super.setup(settings$);

    // Logging helper for the stream typeName$
    // This convention is used a lot below as well
    // Note that logging is disabled if debugThis (above) is false or enabled: false
    const typeNameLog = this.log.rxTap('typeName$', { enabled: false });

    // List of type names (comma separated) to prefetch.
    // This rarely changes, except when the name comes from a `[...]` token
    const typeName$ = this.contentTypeName$.pipe(
      typeNameLog.pipe(),
      distinctUntilChanged(),
      typeNameLog.distinctUntilChanged(),
      shareReplay(1),
      typeNameLog.shareReplay(),
    );

    // All the data which was retrieved from the server
    // Note that the backend should not be accessed till getAll$ is true
    // So the stream should be prefilled with an empty array
    // and shared
    const logAllOfType = this.log.rxTap('allOfType$', { enabled: false });
    const logAllOfTypeGetEntities = this.log.rxTap('allOfType$/getEntities', { enabled: false });
    const allOfType$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      logAllOfType.pipe(),
      mergeMap(([typeName, _]) => this.queryService.getEntities({
        contentTypes: [typeName],
        itemIds: [],
        fields: this.fieldsToRetrieve(this.settings$.value),
        log: 'all$'
      }).pipe(
        logAllOfTypeGetEntities.pipe(),
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        logAllOfTypeGetEntities.map('queryEntityMapping'),
        startWith({ data: [] as PickerItem[], loading: true }),
        logAllOfTypeGetEntities.read(),
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      logAllOfType.read(),
      shareReplay(1),
      logAllOfType.shareReplay(),
    );

    // Items to prefetch which were found in the cache
    const logPrefetchInCache = this.log.rxTap('prefetchInCache$', { enabled: false });
    const prefetchInCache$ = this.prefetchEntityGuids$.pipe(
      logPrefetchInCache.pipe(),
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
      startWith([] as PickerItem[]),
      logPrefetchInCache.read(),
      shareReplay(1),
      logPrefetchInCache.shareReplay(),
    );

    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const logPrefetchNotFoundGuids = this.log.rxTap('prefetchNotFoundGuids$', { enabled: false });
    const prefetchNotFoundGuids$ = combineLatest([prefetchInCache$, this.prefetchEntityGuids$]).pipe(
      logPrefetchNotFoundGuids.pipe(),
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    // These GUIDs should be force-loaded from the server
    // This is a combination of the missing prefetches and the selected entityGuids
    // TODO: this isn't quite right
    // - atm it always loads all selected items, but it should only do this if they may have changed
    // - to fix this, we need to know if the selected items have changed and probably place that in another list
    const logGuidsToForceLoad = this.log.rxTap('guidsToForceLoad$', { enabled: true });
    const guidsToForceLoad$ = combineLatest([prefetchNotFoundGuids$, this.guidsToRefresh$]).pipe(
      logGuidsToForceLoad.pipe(),
      map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      logGuidsToForceLoad.distinctUntilChanged(),
    );

    // Load specific items as overrides
    // to ensure that we always use the latest copy
    // TODO: Not quite right yet - see guidsToForceLoad$
    const logOverrides = this.log.rxTap('overrides$', { enabled: true });
    const overrides$ = combineLatest([typeName$, guidsToForceLoad$]).pipe(
      logOverrides.pipe(),
      mergeMap(([typeName, guids]) => this.queryService.getEntities({
        contentTypes: [typeName],
        itemIds: guids,
        fields: this.fieldsToRetrieve(this.settings$.value),
        log: logOverrides.name,
      }).pipe(
          map(data => {
            const items: PickerItem[] = data["Default"].map(entity => {
              return this.queryEntityMapping(entity)
            });
            return { data: items, loading: false };
          }),
          startWith({ data: [] as PickerItem[], loading: true })
        )
      ),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
      logOverrides.shareReplay(),
    );

    // Create a loading$ stream to indicate if we are loading
    const logLoading = this.log.rxTap('loading$', { enabled: false });
    this.loading$ = combineLatest([allOfType$, overrides$]).pipe(
      logLoading.pipe(),
      map(([all, overrides]) => all.loading || overrides.loading),
      distinctUntilChanged(),
      logLoading.distinctUntilChanged(),
    );

    // Create the main data$ stream merging all, overrides and prefetches
    const logData = this.log.rxTap('data$', { enabled: false });
    this.data$ = combineLatest([prefetchInCache$, allOfType$, overrides$]).pipe(
      logData.pipe(),
      map(([prefetch, all, overrides]) => {
        // merge and take the last unique value in the array (should be most recent)
        // it uses the Map and the `Value` property to ensure uniqueness
        const combined = [...prefetch, ...all.data, ...overrides.data];
        const data = [...new Map(combined.map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
      logData.shareReplay(),
    );
  }

  destroy(): void {
    this.contentTypeName$.complete();
    super.destroy();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  private queryEntityMapping(entity: QueryEntity): PickerItem {
    return this.entity2PickerItem(entity, null, /* mustUseGuid: */ true);
  }
}