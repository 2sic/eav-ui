import { EntityInfo } from "projects/edit-types";
import { BehaviorSubject, Subscription } from "rxjs";
import { EntityService } from "../../../shared/services";
import { EntityCacheService } from "../../../shared/store/ngrx-data";

export class EntityFieldDataSource {
  public data$ = new BehaviorSubject<EntityInfo[]>([]);

  private subscriptions = new Subscription();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) { }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchEntityData(contentTypeName: string, entitiesFilter: string[]): void {
   this.subscriptions.add(this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      this.data$.next(items);
    }));
  }

}