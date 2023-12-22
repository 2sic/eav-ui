import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EntityService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    super();

    const typeName$ = this.contentTypeName$.pipe(distinctUntilChanged(), shareReplay(1));

    const all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      mergeMap(([typeName, _]) => this.entityService.getAvailableEntities(typeName, []).pipe(
        map(data => { return { data, loading: false }; }),
        startWith({ data: [] as PickerItem[], loading: true })
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    const prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
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

    const overrides$ = combineLatest([typeName$, combinedGuids$]).pipe(
      mergeMap(([typeName, guids]) => this.entityService.getAvailableEntities(typeName, guids).pipe(
        map(data => { return { data, loading: false }; }),
        startWith({ data: [] as PickerItem[], loading: true })
      )),
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
    this.contentTypeName$.complete();
    
    super.destroy();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }
}