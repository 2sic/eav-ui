import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EntityService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();
  private entityGuids$ = new BehaviorSubject<string[]>([]);
  private prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  private all$ = new Observable<PickerItem[]>();
  private overrides$ = new Observable<PickerItem[]>();
  private prefetch$ = new Observable<PickerItem[]>();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    super();

    const typeName$ = this.contentTypeName$.pipe(distinctUntilChanged(), shareReplay(1));
    this.all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      mergeMap(([typeName, _]) => this.entityService.getAvailableEntities(typeName, [])),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );
    
    let missingInPrefetch$ = combineLatest([
      this.prefetch$,
      this.prefetchEntityGuids$,
    ]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    let combinedGuids$ = combineLatest([
      missingInPrefetch$,
      this.entityGuids$,
    ]).pipe(
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );
      
    this.overrides$ = combineLatest([
      typeName$,
      combinedGuids$
    ]).pipe(
      mergeMap(([typeName, guids]) => this.entityService.getAvailableEntities(typeName, guids)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.data$ = combineLatest([
      this.all$,
      this.overrides$,
      this.prefetch$,
    ]).pipe(
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all, ...overrides].map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
    );
  }

  destroy(): void {
    this.contentTypeName$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();

    this.subscriptions.unsubscribe();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  prefetchEntityGuids(entityGuids: string[]): void {
    // TODO: @SDV move this to some helper
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }
}