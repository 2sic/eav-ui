import { WIPDataSourceItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, map } from "rxjs";
import { EntityService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";

export class EntityFieldDataSource {
  public data$: Observable<WIPDataSourceItem[]>;

  private contentTypeName$ = new BehaviorSubject<string>(null);
  private entityGuids$ = new BehaviorSubject<string[]>(null);
  private getAll$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(null);
  private subscriptions = new Subscription();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    this.data$ = combineLatest([
      this.contentTypeName$.pipe(distinctUntilChanged()),
      this.entityGuids$.pipe(distinctUntilChanged()),
      this.getAll$.pipe(distinctUntilChanged()),
      this.loading$.pipe(distinctUntilChanged()),
      this.entityCacheService.getEntities$(),
    ])
      .pipe(map(([contentTypeName, entityGuids, getAll, loading, entities]) => {
        const data = entities;
        if (getAll && loading == null) {
          this.fetchData(contentTypeName, entityGuids);
        }
        return data;
      }), distinctUntilChanged()
      );
  }

  destroy(): void {
    this.contentTypeName$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();

    this.subscriptions.unsubscribe();
  }

  getAll(): void {
    this.getAll$.next(true);
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  // @2SDV TODO: Talk with @2DM about this, more data is needed, send settings.moreFields as parameter so objects with more parameters will be returned
  // 2dm 2023-01-22 #maybeSupportIncludeParentApps
  // const includeParentApps = this.settings$.value?.IncludeParentApps == true;
  private fetchData(contentTypeName: string, entitiesFilter: string[]): void {
    this.loading$.next(true);
    this.subscriptions.add(this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      // this.loaded$.next(true);
      this.loading$.next(false);
    }));
  }
}