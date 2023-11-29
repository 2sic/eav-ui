import { WIPDataSourceItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, filter, map } from "rxjs";
import { EntityService } from "../../../shared/services";
import { EntityCacheService } from "../../../shared/store/ngrx-data";

export class EntityFieldDataSource {
  public data$: Observable<WIPDataSourceItem[]>;

  public contentTypeName$ = new BehaviorSubject<string>(null);
  public entityGuids$ = new BehaviorSubject<string[]>(null);

  private getAll$ = new BehaviorSubject<boolean>(false);
  private loaded$ = new BehaviorSubject<boolean>(false);

  private subscriptions = new Subscription();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    this.data$ = combineLatest([
      this.contentTypeName$,
      this.entityGuids$,
      this.getAll$,
      this.loaded$,
      this.entityCacheService.getEntities$()
    ])
      .pipe(map(([contentTypeName, entityGuids, getAll, loaded, entities]) => {
        const data = entityGuids == null ? entities : entities.filter(entity => entityGuids.includes(entity.guid));
        if (!getAll || loaded) {
          return data;
        } else if (getAll && !loaded) {
          this.fetchData(contentTypeName, entityGuids);
          return data;
        }
       }));
   }

  destroy(): void {
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
    this.subscriptions.add(this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      this.loaded$.next(true);
    }));
  }
}