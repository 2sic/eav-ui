import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
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

    // shorten access to the log function
    const log = this.logger.qAdd();

    // List of type names (comma separated) to prefetch
    const typeName$ = this.contentTypeName$.pipe(
      tap(contentTypeName => log('typeName$ init', 'contentTypeName', contentTypeName)),
      distinctUntilChanged(),
      tap(contentTypeName => log('typeName$ changed', 'contentTypeName', contentTypeName)),
      shareReplay(1),
      tap(contentTypeName => log('typeName$ used', 'contentTypeName', contentTypeName)),
    );

    // All the data which was retrieved from the server
    // Note that the backend should not be accessed till getAll$ is true
    // So the stream should be prefilled with an empty array
    // and shared
    const all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      tap(([typeName, getAll]) => log('all$ init', 'typeName', typeName, 'getAll', getAll)),
      mergeMap(([typeName, _]) => this.queryService.getEntities({
        contentTypes: [typeName],
        itemIds: [],
        fields: this.calculateMoreFields(),
        log: 'all$'
      }).pipe(
        tap(data => log('all$ getEntities init', 'data', data)),
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        tap(data => log('all$ getEntities changed', 'data', data)),
        startWith({ data: [] as PickerItem[], loading: true }),
        tap(data => log('all$ getEntities used', 'data', data)),
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      tap((all) => log('all$ changed', 'all', all)),
      shareReplay(1),
      tap((all) => log('all$ used', 'all', all)),
    );

    // List of guids to prefetch
    const prefetchInCache$ = this.prefetchEntityGuids$.pipe(
      tap(prefetchEntityGuids => log('prefetch$ init', 'prefetchEntityGuids', prefetchEntityGuids)),
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
      startWith([] as PickerItem[]),
      tap(prefetch => log('prefetch$ changed', 'prefetch', prefetch)),
      shareReplay(1),
      tap(prefetch => log('prefetch$ used', 'prefetch', prefetch)),
    );

    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const prefetchNotInCache = combineLatest([prefetchInCache$, this.prefetchEntityGuids$]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    const combinedGuids$ = combineLatest([prefetchNotInCache, this.entityGuids$]).pipe(
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    const overrides$ = combineLatest([typeName$, combinedGuids$]).pipe(
      tap(([typeName, guids]) => log('overrides$ start', 'typeName', typeName, 'guids', guids)),
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
      tap(overrides => log('overrides$ end', 'overrides', overrides)),
    );

    this.loading$ = combineLatest([all$, overrides$]).pipe(
      tap(([all, overrides]) => log('loading$ start', 'all', all, 'overrides', overrides)),
      map(([all, overrides]) => all.loading || overrides.loading),
      distinctUntilChanged(),
      tap(loading => log('loading$ used', 'loading', loading)),
    );

    this.data$ = combineLatest([all$, overrides$, prefetchInCache$]).pipe(
      tap(([all, overrides, prefetch]) => log('data$ start', 'all', all, 'overrides', overrides, 'prefetch', prefetch)),
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all.data, ...overrides.data].map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
      tap(data => log('data$ end', 'data', data)),
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