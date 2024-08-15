import { PickerItem } from './../models/picker-item.model';
import { Observable, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap } from "rxjs";
import { QueryService } from "../../../../shared/services";
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { DataWithLoading } from '../models/data-with-loading';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * This is the base class for data-sources providing data from
 * - entities
 * - queries
 */
@Injectable()
export abstract class DataSourceEntityQueryBase extends DataSourceBase {

  //#region Inject and blank constructor

  protected querySvc = inject(QueryService);
  protected entityCacheSvc = inject(PickerDataCacheService);

  constructor(logger: EavLogger) {
    super(logger);
  }

  //#endregion

  /**
   * The params are either query-url params or the type-name.
   * Implemented as observable, since all requests depend on observables.
   * If there is ever an httpSignal service or something, then this should be migrated.
   */
  private typeOrParams = signal<string>(null);
  private typeOrParams$ = new Subject<string>();
  private paramsDebounced$ = this.typeOrParams$.pipe(distinctUntilChanged());

  // /**
  //  * Guids of items which _should_ be in the prefetched cache.
  //  * It's an observable, since it's mostly used as that.
  //  * There is also a corresponding signal.
  //  * @memberof DataSourceEntityQueryBase
  //  */
  // private prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  // private prefetchEntityGuids = toSignal(this.prefetchEntityGuids$);

  // /** Prefetch the data from the initially specified guids - from the prefetch-cache */
  // protected _prefetch = toSignal(this.getPrefetchStream(), { initialValue: this.noItemsLoadingFalse });

  // /**
  //  * Guids of items which _should_ be refreshed from the backend.
  //  * These are either prefetches which were missing in the cache,
  //  * or items which have been updated or added.
  //  * @memberof DataSourceEntityQueryBase
  //  */
  // private _guidsToForceLoad = computed(() => {
  //   // Check if anything should be prefetched but was missing
  //   // so we can retrieve it from the server
  //   const alreadyFetched = this._prefetch();
  //   const prefetchGuids = this.prefetchEntityGuids();
  //   const notYetFetched = prefetchGuids.filter(guid => !alreadyFetched.data.find(item => item.value === guid));
  //   const additionalGuids = this.guidsToRefresh();
  //   const mergedDistinct = [...notYetFetched, ...additionalGuids].filter(RxHelpers.distinct);
  //   this.log.a('guidsToForceLoad', { prefetchGuids, alreadyFetched, notYetFetched, additionalGuids, mergedDistinct });
  //   return mergedDistinct;
  // }, { equal: RxHelpers.arraysEqual });

  // /**
  //  * Overriding data items which should be added to the "all" list
  //  * or replace the items in the "all" list.
  //  * @memberof DataSourceEntityQueryBase
  //  */
  // private _overrides = toSignal(combineLatest([
  //   this.paramsDebounced$,
  //   toObservable(this._guidsToForceLoad)
  // ]).pipe(
  //   mergeMap(([params, guids]) => this.getFromBackend(params, guids, 'overrides')),
  //   // preserve previous requests and stack on each other
  //   pairwise(),
  //   map(([old, current]) => {
  //     const merged = [... new Map([...old.data, ...current.data].map(item => [item.value, item])).values()];
  //     return { data: merged, loading: current.loading } as DataWithLoading<PickerItem[]>;
  //   }),
  //   shareReplay(1),
  // ), { initialValue: this.noItemsLoadingFalse });

  /**
   * Signal containing "all" the data from the backend when not filtered.
   * It's triggered for retrieval when
   * - the params change (in many cases just at start, but sometimes ongoing eg. view-data picker)
   * @memberof DataSourceEntityQueryBase
   */
  private _all = toSignal(combineLatest([
    this.paramsDebounced$,
    this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll), map(x => [])),
  ]).pipe(
    mergeMap(([typeName]) => this.getFromBackend(typeName, [], 'getAll')),
  ), { initialValue: this.noItemsLoadingFalse });

  private prefetchNew = signal<DataWithLoading<PickerItem[]>>(this.noItemsLoadingFalse);

  /** Additional items which were updated after sub-edits */
  private modified = signal<DataWithLoading<PickerItem[]>>(this.noItemsLoadingFalse);

  public override data = computed(() => {
    // const prefetch = this._prefetch().data;
    // const overrides = this._overrides().data;
    const prefetch = this.prefetchNew().data;
    const all = this._all().data;
    const modified = this.modified().data;
    const data = [...new Map([...prefetch, ...all, ...modified].map(item => [item.value, item])).values()];
    this.log.a('data', { prefetch, all, overrides: modified, data });
    return data;
  }, { equal: RxHelpers.arraysEqual });

  /** Signal with loading-status */
  // public override loading = computed(() => this._all().loading || this._overrides().loading) as any;
  public override loading = computed(() => this._all().loading || this.modified().loading) as any;


  // protected getPrefetchStream(): Observable<DataWithLoading<PickerItem[]>> {
  //   // older notes - not sure if they apply...
  //   // Figure out the prefetch
  //   // Note that if we're using a string-data based query, there will be no prefetch
  //   // So it just needs to return an empty list

  //   if (this.prefetchStream)
  //     return this.prefetchStream;

  //   // const logPrefetchInCache = this.log.rxTap('prefetchInCache$', { enabled: false });
  //   return this.prefetchStream = this.prefetchEntityGuids$.pipe(
  //       distinctUntilChanged(),
  //       // only retrieve things if there are entity-guids
  //       filter(entityGuids => entityGuids?.length > 0),
  //       // get and keep the latest retrieved entities
  //       mergeMap(entityGuids => this.entityCacheSvc.getEntities$(entityGuids).pipe(
  //         map(data => ({ data, loading: false } as DataWithLoading<PickerItem[]>))
  //       )),
  //       shareReplay(1),
  //     );
  // }
  // private prefetchStream: Observable<DataWithLoading<PickerItem[]>>;

  initPrefetch(entityGuids: string[]): void {
    const guids = entityGuids.filter(RxHelpers.distinct);
    // this.prefetchEntityGuids$.next(guids);
    // this.addToRefresh(guids);
    this.loadMoreIntoSignal(this.prefetchNew, guids, 'initPrefetch');
  }

  /** Get the data from a query - all or only the ones listed in the guids */
  abstract getFromBackend(params: string, guids: string[], purposeForLog: string)
    : Observable<DataWithLoading<PickerItem[]>>;

  /** Set parameters for retrieval - either contentTypeName or query url parameters */
  setParams(params: string): void {
    this.typeOrParams.set(params);
    this.typeOrParams$.next(params);
  }


  destroy(): void {
    this.typeOrParams$.complete();
    // this.prefetchEntityGuids$.complete();
    this.getAll$.complete();
    super.destroy();
  }

  override addToRefresh(additionalGuids: string[]): void {
    const l = this.log.fn('addToRefresh', { additionalGuids });
    this.loadMoreIntoSignal(this.modified, additionalGuids, 'addToRefresh');
    l.end();
  }

  loadMoreIntoSignal(cache: WritableSignal<DataWithLoading<PickerItem[]>>, additionalGuids: string[], message: string): void {
    const l = this.log.fn('loadMoreIntoSignal', { additionalGuids });
    if (additionalGuids == null || additionalGuids.length === 0)
      return l.end(null, 'no additional guids to load/refresh');

    // get existing value and set loading to true
    const before = cache();
    cache.set({ data: before.data, loading: true });

    this.getFromBackend(this.typeOrParams(), additionalGuids, message)
      .subscribe(additions => {
        const merged = [...new Map([...before.data, ...additions.data].map(item => [item.value, item])).values()];
        l.values({ before, data: additions, merged });
        cache.set({ data: merged, loading: false });
      });
    l.end();
  }
}
