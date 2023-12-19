import { EntityForPicker, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity, QueryStreams } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class QueryFieldDataSource extends DataSourceBase {
  private params$ = new BehaviorSubject<string>('');
  private entityGuids$ = new BehaviorSubject<string[]>([]);
  private prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private queryEntities$ = new BehaviorSubject<PickerItem[]>([]);
  private stringQueryEntities$ = new BehaviorSubject<QueryEntity[]>([]);

  private all$ = new Observable<PickerItem[]>();
  private overrides$ = new Observable<PickerItem[]>();
  private prefetch$ = new Observable<PickerItem[]>();

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

    const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

    this.all$ = combineLatest([
      params$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      mergeMap(([params, _]) => this.queryService.getAvailableEntities(queryUrl, true, params, [])),
      map(data => this.transformData(data)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => {
        if (this.isStringQuery) {
          return this.stringQueryCacheService.getEntities$(this.entityGuid, this.fieldName);
        } else {
          return this.entityCacheService.getEntities$(entityGuids);
        }
      }),
      map(entities => {
        if (this.isStringQuery) {
          return entities.map(entity => this.stringQueryEntityMapping(entity as QueryEntity)) as PickerItem[];
        } else {
          return entities as PickerItem[];
        }
      }),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    let missingInPrefetch$ = combineLatest([
      this.prefetch$,
      this.prefetchEntityGuids$,
    ]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    let combinedGuids$ = combineLatest([
      missingInPrefetch$,
      this.entityGuids$,
    ]).pipe(
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    this.overrides$ = combineLatest([
      params$,
      combinedGuids$
    ]).pipe(
      mergeMap(([params, guids]) => this.queryService.getAvailableEntities(queryUrl, true, params, guids)),
      map(data => this.transformData(data)),
      startWith([] as PickerItem[]),
      shareReplay(1),
    );

    this.data$ = combineLatest([
      this.all$,
      this.overrides$,
      this.prefetch$,
    ]).pipe(
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all, ...overrides].map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
    );
  }

  destroy(): void {
    this.params$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();
    this.queryEntities$.complete();
    this.stringQueryEntities$.complete();

    this.subscriptions.unsubscribe();
  }

  add(contentType?: string, entityGuids?: string[]): void {
    this.params(contentType);
    this.entityGuids(entityGuids);
  }

  prefetch(contentType?: string, entityGuids?: string[]): void {
    this.params(contentType);
    this.prefetchEntityGuids(entityGuids);
  }

  params(params: string): void {
    this.params$.next(params);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  prefetchEntityGuids(entityGuids: string[]): void {
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
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