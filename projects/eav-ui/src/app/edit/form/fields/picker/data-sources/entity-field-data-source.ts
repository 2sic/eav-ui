import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from "rxjs";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { QueryService } from "../../../../shared/services";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const debugThis = true;

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();

  constructor(
    protected settings$: BehaviorSubject<FieldSettings>,
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
  ) {
    super(settings$, new EavLogger('EntityFieldDataSource', debugThis));

    // Logging helper for the stream typeName$
    // This convention is used a lot below as well
    // Note that logging is disabled if debugThis (above) is false or enabled: false
    const typeNameLog = this.logger.rxTap('typeName$', { enabled: false });

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
    const allOfTypeLog = this.logger.rxTap('allOfType$', { enabled: false });
    const AllOfTypeGetEntitiesLog = this.logger.rxTap('allOfType$/getEntities', { enabled: false });
    const allOfType$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      allOfTypeLog.pipe(),
      mergeMap(([typeName, _]) => this.queryService.getEntities({
        contentTypes: [typeName],
        itemIds: [],
        fields: this.calculateMoreFields(),
        log: 'all$'
      }).pipe(
        AllOfTypeGetEntitiesLog.pipe(),
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        AllOfTypeGetEntitiesLog.map('queryEntityMapping'),
        startWith({ data: [] as PickerItem[], loading: true }),
        AllOfTypeGetEntitiesLog.read(),
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      allOfTypeLog.read(),
      shareReplay(1),
      allOfTypeLog.shareReplay(),
    );

    // Items to prefetch which were found in the cache
    const prefetchInCacheLog = this.logger.rxTap('prefetchInCache$', { enabled: true });
    const prefetchInCache$ = this.prefetchEntityGuids$.pipe(
      prefetchInCacheLog.pipe(),
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
      startWith([] as PickerItem[]),
      prefetchInCacheLog.read(),
      shareReplay(1),
      prefetchInCacheLog.shareReplay(),
    );

    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const prefetchNotFoundGuidsLog = this.logger.rxTap('prefetchNotFoundGuids$', { enabled: false });
    const prefetchNotFoundGuids$ = combineLatest([prefetchInCache$, this.prefetchEntityGuids$]).pipe(
      prefetchNotFoundGuidsLog.pipe(),
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    // These GUIDs should be force-loaded from the server
    // This is a combination of the missing prefetches and the selected entityGuids
    // TODO: this isn't quite right
    // - atm it always loads all selected items, but it should only do this if they may have changed
    // - to fix this, we need to know if the selected items have changed and probably place that in another list
    const guidsToForceLoadLog = this.logger.rxTap('guidsToForceLoad$');
    const guidsToForceLoad$ = combineLatest([prefetchNotFoundGuids$, this.entityGuids$]).pipe(
      guidsToForceLoadLog.pipe(),
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      guidsToForceLoadLog.distinctUntilChanged(),
    );

    // Load specific items as overrides
    // to ensure that we always use the latest copy
    // TODO: Not quite right yet - see guidsToForceLoad$
    const overridesLog = this.logger.rxTap('overrides$');
    const overrides$ = combineLatest([typeName$, guidsToForceLoad$]).pipe(
      overridesLog.pipe(),
      mergeMap(([typeName, guids]) => queryService.getEntities({
        contentTypes: [typeName],
        itemIds: guids,
        fields: this.calculateMoreFields(),
        log: overridesLog.name,
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
      overridesLog.shareReplay(),
    );

    // Create a loading$ stream to indicate if we are loading
    const loading$log = this.logger.rxTap('loading$', { enabled: false });
    this.loading$ = combineLatest([allOfType$, overrides$]).pipe(
      loading$log.pipe(),
      map(([all, overrides]) => all.loading || overrides.loading),
      distinctUntilChanged(),
      loading$log.distinctUntilChanged(),
    );

    // Create the main data$ stream merging all, overrides and prefetches
    const data$log = this.logger.rxTap('data$', { enabled: false });
    this.data$ = combineLatest([prefetchInCache$, allOfType$, overrides$]).pipe(
      data$log.pipe(),
      map(([prefetch, all, overrides]) => {
        // merge and take the last unique value in the array (should be most recent)
        // it uses the Map and the `Value` property to ensure uniqueness
        const combined = [...prefetch, ...all.data, ...overrides.data];
        const data = [...new Map(combined.map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
      data$log.shareReplay(),
    );
  }

  destroy(): void {
    this.contentTypeName$.complete();
    
    super.destroy();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  forceLoadGuids(entityGuids: string[]): void {
    console.warn('2dm');
    debugger;
    this.entityGuids$.next(entityGuids);
  }

  private queryEntityMapping(entity: QueryEntity): PickerItem {
    return this.fillEntityInfoMoreFields(entity);
  }
}