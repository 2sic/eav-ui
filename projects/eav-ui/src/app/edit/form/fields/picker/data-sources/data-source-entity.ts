import { PickerItem } from "projects/edit-types";
import { Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, signal } from '@angular/core';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';
import { DataWithLoading } from '../models/data-with-loading';

const logThis = false;
const nameOfThis = 'DataSourceEntity';

@Injectable()
export class DataSourceEntity extends DataSourceEntityQueryBase {

  //#region Inject and blank constructor

  constructor() { super(new EavLogger(nameOfThis, logThis)); }

  //#endregion

  private contentTypeName$ = new Subject<string>();

  public setup(): this {
    this.log.a('setup - settings$');

    // Logging helper for the stream typeName$
    // This convention is used a lot below as well
    // Note that logging is disabled if debugThis (above) is false or enabled: false
    const typeNameLog = this.log.rxTap('typeName$', { enabled: true });

    // List of type names (comma separated) to prefetch.
    // This rarely changes, except when the name comes from a `[...]` token
    const typeName$ = this.contentTypeName$.pipe(
      typeNameLog.pipe(),
      distinctUntilChanged(),
      typeNameLog.distinctUntilChanged(),
      shareReplay(1),
      typeNameLog.shareReplay(),
    );

    const fieldMask = this.getMaskHelper();


    // All the data which was retrieved from the server
    // Note that the backend should not be accessed till getAll$ is true
    // So the stream should be prefilled with an empty array
    // and shared
    const logAllOfType = this.log.rxTap('allOfType$', { enabled: true });
    const logAllOfTypeGetEntities = this.log.rxTap('allOfType$/getEntities', { enabled: true });
    const allOfType$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll), tap(getall => console.log('getAll:' + getall) )),
    ]).pipe(
      logAllOfType.pipe(),
      mergeMap(([typeName, _]) => this.querySvc.getEntities({
        contentTypes: [typeName],
        itemIds: [],
        fields: this.fieldsToRetrieve(this.settings()),
        log: 'all$'
      }).pipe(
        logAllOfTypeGetEntities.pipe(),
        map(data => {
          const items: PickerItem[] = data.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true })); // this.queryEntityMapping(entity));
          return { data: items, loading: false };
        }),
        logAllOfTypeGetEntities.map('queryEntityMapping'),
        startWith(this.noItemsLoadingTrue),
        logAllOfTypeGetEntities.read(),
      )),
      startWith(this.noItemsLoadingFalse),
      logAllOfType.read(),
      shareReplay(1),
      logAllOfType.shareReplay(),
    );
    this.fillSignal(allOfType$, this._all);


    // // Items to prefetch which were found in the cache
    // // const logPrefetchInCache = this.log.rxTap('prefetchInCache$', { enabled: false });
    const prefetch$ = this.getPrefetchStream();

    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const logPrefetchNotFoundGuids = this.log.rxTap('prefetchNotFoundGuids$', { enabled: false });
    const prefetchNotFoundGuids$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
      logPrefetchNotFoundGuids.pipe(),
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.data.find(item => item.value === guid))),
    );

    // These GUIDs should be force-loaded from the server
    // This is a combination of the missing prefetches and the selected entityGuids
    // TODO: this isn't quite right
    // - atm it always loads all selected items, but it should only do this if they may have changed
    // - to fix this, we need to know if the selected items have changed and probably place that in another list
    const logGuidsToForceLoad = this.log.rxTap('guidsToForceLoad$', { enabled: true });
    const guidsToForceLoad$ = combineLatest([prefetchNotFoundGuids$, this.guidsToRefresh$]).pipe(
      logGuidsToForceLoad.pipe(),
      map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(RxHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(RxHelpers.arraysEqual),
      logGuidsToForceLoad.distinctUntilChanged(),
    );

    // Load specific items as overrides
    // to ensure that we always use the latest copy
    // TODO: Not quite right yet - see guidsToForceLoad$
    const logOverrides = this.log.rxTap('overrides$', { enabled: true });
    const overrides$ = combineLatest([typeName$, guidsToForceLoad$]).pipe(
      logOverrides.pipe(),
      mergeMap(([typeName, guids]) => this.querySvc.getEntities({
        contentTypes: [typeName],
        itemIds: guids,
        fields: this.fieldsToRetrieve(this.settings()),
        log: logOverrides.name,
      }).pipe(
          map(data => {
            const items = data.Default.map(entity => fieldMask.entity2PickerItem({ entity, streamName: null, mustUseGuid: true }));
            return { data: items, loading: false } as DataWithLoading<PickerItem[]>;
          }),
          startWith(this.noItemsLoadingTrue)
        )
      ),
      startWith(this.noItemsLoadingFalse),
      shareReplay(1),
      logOverrides.shareReplay(),
    );

    this.fillSignal(overrides$, this._overrides);
    
    return this;
  }

  destroy(): void {
    this.contentTypeName$.complete();
    super.destroy();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }
}