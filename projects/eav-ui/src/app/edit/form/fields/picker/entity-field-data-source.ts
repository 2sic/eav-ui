import { WIPDataSourceItem } from "projects/edit-types";
import { BehaviorSubject, Subscription } from "rxjs";
import { EntityService } from "../../../shared/services";
import { EntityCacheService } from "../../../shared/store/ngrx-data";

export class EntityFieldDataSource {
  public data$ = new BehaviorSubject<WIPDataSourceItem[]>([]);

  private subscriptions = new Subscription();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) { }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  // @2SDV TODO: Talk with @2DM about this, more data is needed, send settings.moreFields as parameter so objects with more parameters will be returned
  // 2dm 2023-01-22 #maybeSupportIncludeParentApps
  // const includeParentApps = this.settings$.value?.IncludeParentApps == true;
  fetchData(contentTypeName: string, entitiesFilter: string[]): void {
    this.subscriptions.add(this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      this.data$.next(items);
    }));
  }

}