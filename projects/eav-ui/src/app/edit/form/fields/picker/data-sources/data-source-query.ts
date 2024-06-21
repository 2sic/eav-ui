import { PickerItem, messagePickerItem, placeholderPickerItem } from "projects/edit-types";
import { Observable, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, of, shareReplay, startWith } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Injector, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { DataWithLoading } from '../models/data-with-loading';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';

const logThis = false;
const nameOfThis = 'DataSourceQuery';
const logRx = true;

@Injectable()
export class DataSourceQuery extends DataSourceEntityQueryBase {

  //#region Inject and blank constructor

  private translate = inject(TranslateService);
  private injector = inject(Injector);

  constructor() { super(new EavLogger(nameOfThis, logThis)); }

  //#endregion
  
  private params$ = new Subject<string>();
  private _queryParams = toSignal(this.params$);
  private _queryParamsDebounce = computed(() => this._queryParams(), { equal: RxHelpers.stringEquals });

  private appId: number;

  private isForStringField = signal(false);

  setupQuery(isForStringField: boolean, entityGuid: string, fieldName: string, appId: string): void {
    this.log.a('setupQuery', ['appId', appId, 'isForStringField', isForStringField, 'entityGuid', entityGuid, 'fieldName', fieldName]);

    this.isForStringField.set(isForStringField);

    this.appId = Number(appId);
    const sett = this.settings();
    const streamName = sett.StreamName;
    

    const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

    // TODO: SHOULD BE able to change this to not use an effect at all
    // Get all the "main" data
    effect(() => {
      // Wait till get-all is triggered
      if (!this.getAll()) return;
      const params = this._queryParamsDebounce();
      this.observableFromQuery(streamName, params, [])
        .pipe(
          map(set => ({ ...set, data: this.transformData(set.data, streamName) })),
        )
        .subscribe(this._all.set);
    }, { injector: this.injector, allowSignalWrites: true });



    // Figure out the prefetch
    // Note that if we're using a string-data based query, there will be no prefetch
    // So it just needs to return an empty list
    const prefetch$ = this.getPrefetchStream();
    // this.fillSignal(prefetch$, this._prefetch);

    const missingInPrefetch$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.data.find(item => item.value === guid))),
    );

    const guidsToForceLoad$ = combineLatest([missingInPrefetch$, this.guidsToRefresh$]).pipe(
      map(([missingInPrefetch, refreshGuids]) => [...missingInPrefetch, ...refreshGuids].filter(RxHelpers.distinct)),
      filter(guids => guids?.length > 0),
      // distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    const overrides$ = combineLatest([params$, guidsToForceLoad$]).pipe(
      mergeMap(([params, guids]) => this.observableFromQuery(streamName, params, guids)),
      map(set => ({
        data: this.transformData(set.data, streamName),
        loading: set.loading,
      })),
      startWith(this.noItemsLoadingFalse),
      shareReplay(1),
    );

    this.fillSignal(overrides$, this._overrides);
  }

  /** Get the data from a query - all or only the ones listed in the guids */
  observableFromQuery(streamName: string, params: string, guids: string[])
    : Observable<DataWithLoading<QueryStreams>> {
    // If the configuration isn't complete, the query can be empty
    const sett = this.settings();
    const queryName = sett.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? sett.Query : `${sett.Query}/${streamName}`
      : null;

    // If no query, return a dummy item with a message
    if (!queryUrl)
      return of<DataWithLoading<QueryStreams>>({
          data: {
            'Default': [
              {
                Id: -1,
                Guid: null,
                Title: this.translate.instant('Fields.Picker.QueryNotConfigured'),
              },
            ],
          },
          loading: true,
        }
      );

    // Default case, get the data
    const lGetQs = this.log.rxTap('queryService', { enabled: logRx });
    return this.querySvc
      .getAvailableEntities(queryUrl, true, params, this.fieldsToRetrieve(this.settings()), guids)
      .pipe(
        lGetQs.pipe(),
        map(data => ({ data, loading: false } as DataWithLoading<QueryStreams>)),
        startWith({ data: {} as QueryStreams, loading: true } as DataWithLoading<QueryStreams>)
      );
  }

  destroy(): void {
    this.params$.complete();
    super.destroy();
  }

  params(params: string): void {
    this.params$.next(params);
  }

  transformData(data: QueryStreams, streamName: string | null): PickerItem[] {
    const valueMustBeGuid = this.isForStringField();
    this.log.a('transformData', ['data', data, 'streamName', streamName]);
    if (!data)
      return [messagePickerItem(this.translate, 'Fields.Picker.QueryErrorNoData')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => { 
      if (!data[stream]) {
        errors.push(placeholderPickerItem(this.translate, 'Fields.Picker.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }
        
      items = items.concat(data[stream].map(entity => this.getMaskHelper().entity2PickerItem({ entity, streamName: stream, mustUseGuid: valueMustBeGuid })));
    });
    return [...errors, ...this.setDisableEdit(items)];
  }

  private setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const appId = e.data?.AppId;
        e.noEdit = appId != null && appId !== this.appId;
        e.noDelete = e.noEdit;
      });
    return queryEntities;
  }
}