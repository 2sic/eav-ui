import { Injectable, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, distinctUntilChanged, filter, map, switchMap } from "rxjs";
import { transient } from '../../../../../../../core';
import { ClassLogger } from '../../../../shared/logging';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { QueryService } from '../../../../shared/services/query.service';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from './../models/picker-item.model';
import { DataSourceBase, logSpecsDataSourceBase } from './data-source-base';

export const logSpecsDataSourceEntityQueryBase: typeof logSpecsDataSourceBase & any = {
  ...logSpecsDataSourceBase,
  all: true,
  initPrefetch: false,
  getFromBackend: false,
  addToRefresh: false,
  loadMoreIntoSignal: true,
  ['loadMoreIntoSignal-data']: true,
}

/**
 * This is the base class for data-sources providing data from
 * - entities
 * - queries
 */
@Injectable()
export abstract class DataSourceEntityQueryBase extends DataSourceBase {

  //#region Inject and blank constructor

  abstract log: ClassLogger<typeof logSpecsDataSourceEntityQueryBase>;

  protected querySvc = transient(QueryService);

  constructor() { super(); }

  ngOnDestroy(): void {
    this.getAll$.complete();
    super.ngOnDestroy();
  }


  //#endregion

  /**
   * The params are either query-url params or the type-name.
   * Implemented as observable, since all requests depend on observables.
   * If there is ever an httpSignal service or something, then this should be migrated.
   */
  #typeOrParams = signalObj<string>('typeOrParams', null);
  #typeOrParams$ = toObservable(this.#typeOrParams);
  #paramsDebounced$ = this.#typeOrParams$.pipe(distinctUntilChanged());

  /** Get the data from a query - all or only the ones listed in the guids */
  protected abstract getFromBackend(params: string, guids: string[], purposeForLog: string) : Observable<DataWithLoading<PickerItem[]>>;


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
  #all = toSignal(combineLatest([
    this.#paramsDebounced$,
    this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll), map(x => [])),
  ]).pipe(
    // SwitchMap ensures that only the latest request is processed
    // This is important if parameters change, so that the old request is not used
    // Otherwise it can lead to scenarios where the old result is used, if the first request takes longer.
    switchMap(([typeName]) => this.getFromBackend(typeName, [], 'getAll')),
  ), { initialValue: this.noItemsLoadingFalse });

  #prefetchNew = signalObj<DataWithLoading<PickerItem[]>>('prefetchNow', this.noItemsLoadingFalse);

  /** Additional items which were updated after sub-edits */
  #modified = signalObj<DataWithLoading<PickerItem[]>>('modified', this.noItemsLoadingFalse);

  public override data = computedObj('data', () => {
    const prefetch = this.#prefetchNew().data;
    const all = this.#all().data;
    const modified = this.#modified().data;
    const data = [...new Map([...prefetch, ...all, ...modified].map(item => [item.value, item])).values()];
    this.log.a('data', { prefetch, all, overrides: modified, data });
    return data;
  });

  /** Signal with loading-status */
  public override loading = computedObj('loading', () => this.#all().loading || this.#modified().loading) as any;

  initPrefetch(entityGuids: string[]): void {
    const l = this.log.fnIfInList('initPrefetch', 'fields', this.fieldName, { entityGuids });
    const guids = entityGuids.filter(RxHelpers.distinct);
    this.#loadMoreIntoSignal(this.#prefetchNew, guids, 'initPrefetch');
  }

  /** Set parameters for retrieval - either contentTypeName or query url parameters */
  setParams(params: string): void {
    this.log.fnIfInList('setParams', 'fields', this.fieldName, { params });
    this.#typeOrParams.set(params);
  }


  public override addToRefresh(additionalGuids: string[]): void {
    const l = this.log.fnIf('addToRefresh', { additionalGuids });
    this.#loadMoreIntoSignal(this.#modified, additionalGuids, 'addToRefresh');
    l.end();
  }

  #loadMoreIntoSignal(cache: WritableSignal<DataWithLoading<PickerItem[]>>, additionalGuids: string[], message: string): void {
    const params = this.#typeOrParams();
    const l = this.log.fnIfInList('loadMoreIntoSignal', 'fields', this.fieldName, { additionalGuids, params });
    if (additionalGuids == null || additionalGuids.length === 0)
      return l.end('no additional guids to load/refresh');

    // get existing value and set loading to true
    cache.update(before => ({ data: before.data, loading: true }));

    this.getFromBackend(params, additionalGuids, message)
      .subscribe(additions => {
        const l = this.log.fn('loadMoreIntoSignal-data', { additionalGuids, additions });
        const before = cache();
        cache.update(before => ({
          data: [...new Map([...before.data, ...additions.data].map(item => [item.value, item])).values()],
          loading: false
        }));
        l.values({ before, additions: additions, merged: cache().data });
      });
    l.end();
  }
}
