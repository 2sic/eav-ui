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
    // Note that logging will automatically be disabled if debugThis is false
    const tn$log = this.logger.rxTap('typeName$');

    // List of type names (comma separated) to prefetch
    const typeName$ = this.contentTypeName$.pipe(
      tn$log.pipe(),
      distinctUntilChanged(),
      tn$log.distinctUntilChanged(),
      shareReplay(1),
      tn$log.shareReplay(),
    );

    // All the data which was retrieved from the server
    // Note that the backend should not be accessed till getAll$ is true
    // So the stream should be prefilled with an empty array
    // and shared
    const all$log = this.logger.rxTap('all$');
    const all$getEntities$log = this.logger.rxTap('all$/getEntities');
    const all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      all$log.pipe(),
      mergeMap(([typeName, _]) => this.queryService.getEntities({
        contentTypes: [typeName],
        itemIds: [],
        fields: this.calculateMoreFields(),
        log: 'all$'
      }).pipe(
        all$getEntities$log.pipe(),
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        all$getEntities$log.map('queryEntityMapping'),
        startWith({ data: [] as PickerItem[], loading: true }),
        all$getEntities$log.read(),
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      all$log.read(),
      shareReplay(1),
      all$log.shareReplay(),
    );

    // List of guids to prefetch
    const prefetch$log = this.logger.rxTap('prefetchInCache$');
    const prefetchInCache$ = this.prefetchEntityGuids$.pipe(
      prefetch$log.pipe(),
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
      startWith([] as PickerItem[]),
      prefetch$log.read(),
      shareReplay(1),
      prefetch$log.shareReplay(),
    );

    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const prefetchNotInCache$log = this.logger.rxTap('prefetchNotInCache$');
    const prefetchNotInCache = combineLatest([prefetchInCache$, this.prefetchEntityGuids$]).pipe(
      prefetchNotInCache$log.pipe(),
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    const combinedGuids$log = this.logger.rxTap('combinedGuids$');
    const combinedGuids$ = combineLatest([prefetchNotInCache, this.entityGuids$]).pipe(
      combinedGuids$log.pipe(),
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      combinedGuids$log.distinctUntilChanged(),
    );

    const overrides$log = this.logger.rxTap('overrides$');
    const overrides$ = combineLatest([typeName$, combinedGuids$]).pipe(
      overrides$log.pipe(),
      mergeMap(([typeName, guids]) => queryService.getEntities({
        contentTypes: [typeName],
        itemIds: guids,
        fields: this.calculateMoreFields(),
        log: 'overrides$'
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
      overrides$log.shareReplay(),
    );

    const loading$log = this.logger.rxTap('loading$');
    this.loading$ = combineLatest([all$, overrides$]).pipe(
      loading$log.pipe(),
      map(([all, overrides]) => all.loading || overrides.loading),
      distinctUntilChanged(),
      loading$log.distinctUntilChanged(),
    );

    const data$log = this.logger.rxTap('data$');
    this.data$ = combineLatest([all$, overrides$, prefetchInCache$]).pipe(
      data$log.pipe(),
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all.data, ...overrides.data].map(item => [item.Value, item])).values()];
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

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  private queryEntityMapping(entity: QueryEntity): PickerItem {
    return this.fillEntityInfoMoreFields(entity);
  }
}