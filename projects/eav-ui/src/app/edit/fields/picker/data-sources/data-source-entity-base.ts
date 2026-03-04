import { Injectable, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, distinctUntilChanged, filter, map, switchMap } from "rxjs";
import { transient } from '../../../../../../../core';
import { ClassLogger } from '../../../../../../../shared/logging';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { QueryService } from '../../../../shared/services/query.service';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem } from '../models/picker-item.model';
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
export abstract class DataSourceEntityBase extends DataSourceBase {

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

  /**
   * Signal containing "all" the data from the backend when not filtered.
   * It's triggered for retrieval when
   * - the params change (in many cases just at start, but sometimes ongoing eg. view-data picker)
   * @memberof DataSourceEntityQueryBase
   */
  #fullList = toSignal(combineLatest([
    this.#paramsDebounced$,
    this.getAll$.pipe(
      distinctUntilChanged(),
      filter(getAll => !!getAll),
      map(() => [] as unknown[])),
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
    const all = this.#fullList().data;
    const modified = this.#modified().data;
    const data = [...new Map([...prefetch, ...all, ...modified].map(item => [item.value, item])).values()];
    this.log.a('data', { prefetch, all, overrides: modified, data });
    return data;
  });

  /** Signal with loading-status */
  public override loading = computedObj('loading', () => this.#fullList().loading || this.#modified().loading) as WritableSignal<boolean>;

  initPrefetch(entityGuids: string[]): void {
    const l = this.log.fnIfInFields('initPrefetch', this.fieldName, { entityGuids });
    // in rare cases - such as json-based entities (which are never stored as real entities)
    // the entityGuids can be null, in which case a prefetch would be pointless and cause errors
    if (entityGuids == null)
      return l.end('no entity guids to prefetch');
    const guids = entityGuids.filter(RxHelpers.distinct);
    this.#loadMoreIntoCache(this.#prefetchNew, guids, 'initPrefetch');
    l.end();
  }

  /** Set parameters for retrieval - either contentTypeName or query url parameters */
  setParams(params: string): void {
    this.log.fnIfInFields('setParams', this.fieldName, { params });
    this.#typeOrParams.set(params);
  }


  public override addToRefresh(additionalGuids: string[]): void {
    const l = this.log.fnIf('addToRefresh', { additionalGuids });
    this.#loadMoreIntoCache(this.#modified, additionalGuids, 'addToRefresh');
    l.end();
  }

  /**
   * Load some data and place it inside a target signal cache, adding to existing data.
   */
  #loadMoreIntoCache(target: WritableSignal<DataWithLoading<PickerItem[]>>, additionalGuids: string[], msgForLog: string): void {
    const params = this.#typeOrParams();
    const l = this.log.fnIfInFields('loadMoreIntoSignal', this.fieldName, { additionalGuids, params, msgForLog });
    if (additionalGuids == null || additionalGuids.length === 0)
      return l.end('no additional guids to load/refresh');

    // get existing value and set loading to true
    target.update(before => ({ data: before.data, loading: true }));

    this.getFromBackend(params, additionalGuids, msgForLog)
      .subscribe(additions => {
        const l = this.log.fn('loadMoreIntoSignal-data', { additionalGuids, additions });
        const before = target();
        target.update(before => ({
          data: [...new Map([...before.data, ...additions.data].map(item => [item.value, item])).values()],
          loading: false
        }));
        l.values({ before, additions: additions, merged: target().data });
      });
    l.end();
  }
}
