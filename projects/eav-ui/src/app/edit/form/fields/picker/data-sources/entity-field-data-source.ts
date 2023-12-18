import { PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from "rxjs";
import { EntityService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase, trigger } from './data-source-base';

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new BehaviorSubject<string>('');
  private entityGuids$ = new BehaviorSubject<string[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  private all$ = new Observable<PickerItem[]>();
  private overrides$ = new Observable<PickerItem[]>();

  constructor(
    private entityService: EntityService,
    private entityCacheService: EntityCacheService,
  ) {
    super();
    this.all$ = this.getAll$.pipe(
      distinctUntilChanged(),
      filter(getAll => !!getAll),
      // @SDV check if this is the right operator
      mergeMap(() => this.entityService.getAvailableEntities(this.contentTypeName$.value, [])),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.overrides$ = this.entityGuids$.pipe(
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityService.getAvailableEntities(this.contentTypeName$.value, entityGuids)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.data$ = combineLatest([
      this.all$,
      this.overrides$,
      // this.entityCacheService.getEntities$(),
    ]).pipe(
      map(([all, overrides/*, cache*/]) => {
        // create dictionary of all and overrides
        // const data = [...all, ...overrides/*, ...cache*/];// filter this list to have only unique items
        // const data = [...all, ...overrides].filter((item, index, self) => self.findIndex(i => i.Value === item.Value) === index);
        const data = [...new Map([...all, ...overrides].map(item => [item.Value, item])).values()]; // this one will always take overrides item over all item
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

  prefetchOrAdd(contentType?: string, entityGuids?: string[]): void {
    this.contentType(contentType);
    this.entityGuids(entityGuids);
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }
}