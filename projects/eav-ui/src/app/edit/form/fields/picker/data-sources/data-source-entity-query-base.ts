import { PickerItem, messagePickerItem, placeholderPickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, of, shareReplay, startWith, tap } from "rxjs";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { DataSourceBase } from './data-source-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { DataWithLoading } from '../models/data-with-loading';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class DataSourceEntityQueryBase extends DataSourceBase {

  //#region Inject and blank constructor

  protected querySvc = inject(QueryService);
  protected entityCacheService = inject(PickerDataCacheService);
  // private translate = inject(TranslateService);

  constructor(logger: EavLogger) { super(logger); }

  //#endregion
  
  // private params$ = new Subject<string>();
  // private _queryParams = toSignal(this.params$);
  // private _queryParams2 = computed(() => this._queryParams(), { equal: RxHelpers.stringEquals });

  // WIP
  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  protected prefetchEntityGuids = toSignal(this.prefetchEntityGuids$);

  /** Prefetch the data from the initially specified guids - from the prefetch-cache */
  protected _prefetch = toSignal(this.getPrefetchStream());

  // WIP 2DM - CONTINUE HERE!
  protected _guidsToForceLoad = computed(() => {
    // Check if anything should be prefetched but was missing
    // so we can retrieve it from the server
    const alreadyFetched = this._prefetch();
    const prefetchGuids = this.prefetchEntityGuids();
    const notYetFetched = prefetchGuids.filter(guid => !alreadyFetched.data.find(item => item.value === guid));
    const additionalGuids = this.guidsToRefresh();
    const mergedDistinct = [...notYetFetched, ...additionalGuids].filter(RxHelpers.distinct);
    return mergedDistinct;
  });



  protected _all = signal<DataWithLoading<PickerItem[]>>({ data: [], loading: true });
  protected _overrides = signal<DataWithLoading<PickerItem[]>>({ data: [], loading: true });
  // protected _prefetch = signal<DataWithLoading<PickerItem[]>>({ data: [], loading: true });
  public override data = computed(() => {
    const data = [...new Map([
      ...this._prefetch().data,
      ...this._all().data,
      ...this._overrides().data
    ].map(item => [item.value, item])).values()];
    console.log('2dm data:');
    return data;
  }, { equal: RxHelpers.arraysEqual });

  /** Signal with loading-status */
  public override loading = computed(() => this._all().loading || this._overrides().loading) as any;


  protected fillSignal<T>(rx: Observable<T>, signal: WritableSignal<T>): void {
    this.subscriptions.add(rx.subscribe(signal.set));
  }




  // private appId: number;

  // setupQuery(isForStringField: boolean, entityGuid: string, fieldName: string, appId: string): void {
  //   this.log.a('setupQuery', ['appId', appId, 'isForStringField', isForStringField, 'entityGuid', entityGuid, 'fieldName', fieldName]);

  //   this.appId = Number(appId);
  //   const sett = this.settings();
  //   const streamName = sett.StreamName;
    
  //   // If the configuration isn't complete, the query can be empty
  //   const queryName = sett.Query;
  //   const queryUrl = !!queryName
  //     ? queryName.includes('/') ? sett.Query : `${sett.Query}/${streamName}`
  //     : null;

  //   const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

  //   const lAll = this.log.rxTap('all$', { enabled: logRx });
  //   const all$ = combineLatest([
  //     params$,
  //     this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll))
  //   ]).pipe(
  //     lAll.pipe(),
  //     mergeMap(([params, _]) => {
  //       // If we don't have a query URL return a single item with a message
  //       if (!queryUrl)
  //         return of<DataWithLoading<QueryStreams>>({
  //             data: {
  //               'Default': [
  //                 {
  //                   Id: -1,
  //                   Guid: null,
  //                   Title: this.translate.instant('Fields.Picker.QueryNotConfigured'),
  //                 },
  //               ],
  //             },
  //             loading: true,
  //           }
  //         );

  //       // Default case, get the data
  //       const lGetQs = this.log.rxTap('queryService', { enabled: logRx });
  //       return this.queryService
  //         .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings()), [])
  //         .pipe(
  //           lGetQs.pipe(),
  //           map(data => { return { data, loading: false }; }),
  //           startWith({ data: {} as QueryStreams, loading: true })
  //         );
  //     }),
  //     lAll.map('before'),
  //     map(set => ({ ...set, data: this.transformData(set.data, streamName, /* mustUseGuid: */ !isForStringField) })),
  //     lAll.map('after'),
  //     startWith(this.noItemsLoadingFalse),
  //     shareReplay(1),
  //     lAll.shareReplay(),
  //   );

  //   // Figure out the prefetch
  //   // Note that if we're using a string-data based query, there will be no prefetch
  //   // So it just needs to return an empty list
  //   const prefetch$ = isForStringField
  //     ? of([] as PickerItem[])
  //     : this.prefetchEntityGuids$.pipe(
  //         distinctUntilChanged(),
  //         filter(entityGuids => entityGuids?.length > 0),
  //         mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
  //         startWith([] as PickerItem[]),
  //         shareReplay(1),
  //       );

  //   let missingInPrefetch$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
  //     // return guids from prefetchEntityGuids that are not in prefetch
  //     map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.value === guid))),
  //   );

  //   let combinedGuids$ = combineLatest([missingInPrefetch$, this.guidsToRefresh$]).pipe(
  //     map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(RxHelpers.distinct)),
  //     filter(guids => guids?.length > 0),
  //     // distinctUntilChanged(GeneralHelpers.arraysEqual),
  //   );

  //   const overrides$ = combineLatest([params$, combinedGuids$]).pipe(
  //     mergeMap(([params, guids]) => this.queryService
  //       .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings()), guids)
  //       .pipe(
  //         map(data => { return { data, loading: false }; }),
  //         startWith({ data: {} as QueryStreams, loading: true })
  //       )
  //     ),
  //     map(set => { return { ...set, data: this.transformData(set.data, streamName, /* valueMustBeGuid: */ !isForStringField) } }),
  //     startWith(this.noItemsLoadingFalse),
  //     shareReplay(1),
  //   );

  //   const lData = this.log.rxTap('data$', { enabled: true });
  //   combineLatest([all$, overrides$, prefetch$]).pipe(
  //     lData.pipe(),
  //     tap(([all, overrides, prefetch]) => {
  //       this._all.set(all);
  //       this._overrides.set(overrides);
  //       this._prefetch.set({ data: prefetch, loading: false });
  //     }),
  //   ).subscribe();

  // }

  // destroy(): void {
  //   this.params$.complete();
  //   super.destroy();
  // }

  // params(params: string): void {
  //   this.params$.next(params);
  // }

  // transformData(data: QueryStreams, streamName: string | null, valueMustBeGuid: boolean): PickerItem[] {
  //   this.log.a('transformData', ['data', data, 'streamName', streamName]);
  //   if (!data)
  //     return [messagePickerItem(this.translate, 'Fields.Picker.QueryErrorNoData')];

  //   let items: PickerItem[] = [];
  //   let errors: PickerItem[] = [];
  //   streamName.split(',').forEach(stream => { 
  //     if (!data[stream]) {
  //       errors.push(placeholderPickerItem(this.translate, 'Fields.Picker.QueryStreamNotFound', ' ' + stream));
  //       return; // TODO: @SDV test if this acts like continue or break
  //     }
        
  //     items = items.concat(data[stream].map(entity => this.getMaskHelper().entity2PickerItem({ entity, streamName: stream, mustUseGuid: valueMustBeGuid })));
  //   });
  //   return [...errors, ...this.setDisableEdit(items)];
  // }

  // private setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
  //   if (queryEntities)
  //     queryEntities.forEach(e => {
  //       const appId = e.data?.AppId;
  //       e.noEdit = appId != null && appId !== this.appId;
  //       e.noDelete = e.noEdit;
  //     });
  //   return queryEntities;
  // }


  protected getPrefetchStream(): Observable<DataWithLoading<PickerItem[]>> {
    // older notes - not sure if they apply...
    // Figure out the prefetch
    // Note that if we're using a string-data based query, there will be no prefetch
    // So it just needs to return an empty list

    if (this.prefetchStream)
      return this.prefetchStream;

    // const logPrefetchInCache = this.log.rxTap('prefetchInCache$', { enabled: false });
    return this.prefetchStream = this.prefetchEntityGuids$.pipe(
        distinctUntilChanged(),
        // only retrieve things if there are entity-guids
        filter(entityGuids => entityGuids?.length > 0),
        // get and keep the latest retrieved entities
        mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids).pipe(
          map(data => ({ data, loading: false } as DataWithLoading<PickerItem[]>))
        )),
        startWith(this.noItemsLoadingFalse),
        shareReplay(1),
      );
  }
  private prefetchStream: Observable<DataWithLoading<PickerItem[]>>;

  initPrefetch(entityGuids: string[]): void {
    const guids = entityGuids.filter(RxHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }


  destroy(): void {
    this.prefetchEntityGuids$.complete();
    // this.guidsToRefresh$.complete();
    // this.getAll$.complete();
    super.destroy();
  }
}