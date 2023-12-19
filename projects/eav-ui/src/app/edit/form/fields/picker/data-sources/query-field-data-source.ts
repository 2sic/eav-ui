import { EntityForPicker, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity, QueryStreams } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class QueryFieldDataSource extends DataSourceBase {
  public error$ = new BehaviorSubject('');

  private includeGuid$ = new BehaviorSubject<boolean>(true);
  private params$ = new BehaviorSubject<string>('');
  private entityGuids$ = new BehaviorSubject<string[]>(null);
  private prefetchOrAdd$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(false);
  private trigger$ = new BehaviorSubject<boolean[]>([false, false]);
  private queryEntities$ = new BehaviorSubject<PickerItem[]>([]);
  private stringQueryEntities$ = new BehaviorSubject<QueryEntity[]>([]);

  private all$ = new Observable<PickerItem[]>();
  private overrides$ = new Observable<PickerItem[]>();

  private streamName: string;

  constructor(
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private translate: TranslateService,
    private settings$: BehaviorSubject<FieldSettings>,
    private isStringQuery: boolean,
    private entityGuid: string,
    private fieldName: string,
    private appId: string,
  ) {
    super();

    const settings = this.settings$.value;
    this.streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${this.streamName}`;
    this.all$ = this.getAll$.pipe(
      distinctUntilChanged(),
      filter(getAll => !!getAll),
      // @SDV check if this is the right operator
      mergeMap(() => this.queryService.getAvailableEntities(queryUrl, true, this.params$.value, [])),
      map(data => this.transformData(data)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.overrides$ = this.entityGuids$.pipe(
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.queryService.getAvailableEntities(queryUrl, true, this.params$.value, entityGuids)),
      map(data => this.transformData(data)),
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
    this.error$.complete();
    this.params$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();
    this.queryEntities$.complete();
    this.stringQueryEntities$.complete();

    this.subscriptions.unsubscribe();
  }

  prefetchOrAdd(contentType?: string, entityGuids?: string[]): void {
    this.params(contentType);
    this.entityGuids(entityGuids);
    this.prefetchOrAdd$.next(true);
  }

  params(params: string): void {
    this.params$.next(params);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  transformData(data: QueryStreams): PickerItem[] { 
    if (!data) {
      const errorItem: PickerItem = {
        Text: this.translate.instant('Fields.EntityQuery.QueryError'),
        Value: null,
        _disableSelect: true,
        _disableDelete: true,
        _disableEdit: true,
      };
      return [errorItem];
    }
    if (!data[this.streamName]) {
      const errorItem: PickerItem = {
        Text: this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + this.streamName,
        Value: null,
        _disableSelect: true,
        _disableDelete: true,
        _disableEdit: true,
      };
      return [errorItem];
    }
    const items: PickerItem[] = data[this.streamName].map(entity => {
      return this.isStringQuery ? this.stringQueryEntityMapping(entity) : this.queryEntityMapping(entity)
    });
    return this.setDisableEdit(items);
  }

  // fetchData(includeGuid: boolean, params: string, entitiesFilter: string[]): void {
  //   const settings = this.settings$.value;
  //   const streamName = settings.StreamName;
  //   const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
  //   this.loading$.next(true);
  //   this.subscriptions.add(this.queryService.getAvailableEntities(queryUrl, includeGuid, params, entitiesFilter).subscribe({
  //     next: (data) => {
  //       if (!data) {
  //         this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
  //         return;
  //       }
  //       if (!data[streamName]) {
  //         this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName);
  //         return;
  //       }
  //       const items: PickerItem[] = data[streamName].map(entity => {
  //         return this.isStringQuery ? this.stringQueryEntityMapping(entity) : this.queryEntityMapping(entity)
  //       });
  //       if (!this.isStringQuery) {
  //         const entities = this.setDisableEdit(items);
  //         this.entityCacheService.loadEntities(entities);
  //         this.queryEntities$.next(entities);
  //       } else {
  //         // If the data belongs to another app, mark it as not editable
  //         const entities = this.setDisableEdit(data[streamName]);
  //         this.stringQueryCacheService.loadEntities(this.entityGuid, this.fieldName, entities);
  //         this.stringQueryEntities$.next(entities);
  //       }
  //       this.loading$.next(false);
  //       this.trigger$.next([false, false]);
  //       this.getAll$.next(false);
  //       this.prefetchOrAdd$.next(false);
  //     },
  //     error: (error) => {
  //       console.error(error);
  //       console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
  //       this.loading$.next(false);
  //       this.trigger$.next([false, false]);
  //       this.getAll$.next(false);
  //       this.prefetchOrAdd$.next(false);
  //     }
  //   }));
  // }

  private queryEntityMapping(entity: QueryEntity): PickerItem {
    const entityInfo: PickerItem = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  private stringQueryEntityMapping(entity: QueryEntity): PickerItem {
    const settings = this.settings$.value;
    const entityInfo: PickerItem = {
      Id: entity.Id,
      Value: entity[settings.Value] ? `${entity[settings.Value]}` : entity[settings.Value],
      Text: entity[settings.Label] ? `${entity[settings.Label]}` : entity[settings.Label],
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  private setDisableEdit<T extends EntityForPicker>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const disable = e.AppId != null && e.AppId.toString() !== this.appId;
        e._disableEdit = disable;
        e._disableDelete = disable;
      });
    // console.log('2dm queryEntities', queryEntities, this.eavService.eavConfig.appId);
    return queryEntities;
  }

  /** fill additional properties that are marked in settings.MoreFields and replace tooltip and information placeholders */
  private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: PickerItem): PickerItem {
    const settings = this.settings$.value;
    const additionalFields = settings.MoreFields?.split(',') || [];
    let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
    let information = this.cleanStringFromWysiwyg(settings.Information);
    additionalFields.forEach(field => {
      entityInfo[field] = entity[field];
      tooltip = tooltip.replace(`[Item:${field}]`, entity[field]);
      information = information.replace(`[Item:${field}]`, entity[field]);
    });
    entityInfo._tooltip = tooltip;
    entityInfo._information = information;
    return entityInfo;
  }

  /** remove HTML tags that come from WYSIWYG */
  private cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }
}