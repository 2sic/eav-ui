import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, filter, map, startWith, tap } from "rxjs";
import { EntityService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class EntityFieldDataSource extends DataSourceBase {
  // public data$: Observable<WIPDataSourceItem[]>;
  // private getAll$ = new BehaviorSubject<boolean>(false);
  // private subscriptions = new Subscription();

  private contentTypeName$ = new BehaviorSubject<string>('');
  private entityGuids$ = new BehaviorSubject<string[]>(null);
  private prefetch$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(false);
  private trigger$ = new BehaviorSubject<boolean[]>([false, false]);

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    super();
    this.subscriptions.add(
      combineLatest([
        this.getAll$.pipe(
          // distinctUntilChanged(),
          filter(getAll => !!getAll), // trigger only on truthy values
          startWith(false),
          // tap(value => console.log('SDV entity getAll$', value))
        ),
        this.prefetch$.pipe(
          // distinctUntilChanged(),
          filter(prefetch => !!prefetch), // trigger only on truthy values
          startWith(false),
          // tap(value => console.log('SDV entity prefetch$', value))
        ),
      ]).pipe(
        // tap(([getAll, prefetch]) => console.log('SDV entity trigger', getAll, prefetch)),
        map(([getAll, prefetch]) => [getAll, prefetch])
      ).subscribe(this.trigger$)
    );


    this.data$ = combineLatest([
      this.trigger$.pipe(
        // distinctUntilChanged(GeneralHelpers.arraysEqual), // only if we don't want to trigger on every getAll
        // tap((value) => console.log('SDV entity trigger$', value))
      ),
      this.entityCacheService.getEntities$().pipe(
        distinctUntilChanged(GeneralHelpers.arraysEqual),
        // tap(() => console.log('SDV entity getEntity$'))
      ),
    ])
      .pipe(map(([trigger, entities]) => {
        const data = entities;
        if (trigger[0] && this.loading$.value === false) {
          this.fetchData(this.contentTypeName$.value, []);
        } else if (trigger[1] && this.loading$.value === false) {
          this.fetchData(this.contentTypeName$.value, this.entityGuids$.value);
        }
        return data;
      })//, distinctUntilChanged(GeneralHelpers.arraysEqual)
      );
  }

  destroy(): void {
    this.contentTypeName$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();

    this.subscriptions.unsubscribe();
  }

  prefetch(contentType?: string, entityGuids?: string[]): void {
    this.contentType(contentType);
    this.entityGuids(entityGuids);
    this.prefetch$.next(true);
  }

  // getAll(): void {
  //   this.getAll$.next(true);
  // }

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
      this.loading$.next(false);
      this.trigger$.next([false, false]);
      this.prefetch$.next(false);
      this.getAll$.next(false);
    }));
  }
}