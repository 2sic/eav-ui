import { EntityForPicker, PickerItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith, tap } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity, QueryStreams } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';

export class QueryFieldDataSource extends DataSourceBase {
  private params$ = new Subject<string>();

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
    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;//?fields=fieldName,...

    const params$ = this.params$.pipe(distinctUntilChanged(), shareReplay(1));

    const all$ = combineLatest([
      params$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll))
    ]).pipe(
      mergeMap(([params, _]) => this.queryService.getAvailableEntities(queryUrl, true, params, []).pipe(
        map(data => { return { data, loading: false }; }),
        startWith({ data: {} as QueryStreams, loading: true })
      )),
      map(set => { return { ...set, data: this.transformData(set.data, streamName) } }),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    const prefetch$ = this.prefetchEntityGuids$.pipe(
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

    let missingInPrefetch$ = combineLatest([prefetch$, this.prefetchEntityGuids$]).pipe(
      // return guids from prefetchEntityGuids that are not in prefetch
      map(([prefetch, prefetchEntityGuids]) => prefetchEntityGuids.filter(guid => !prefetch.find(item => item.Value === guid))),
    );

    let combinedGuids$ = combineLatest([missingInPrefetch$, this.entityGuids$]).pipe(
      map(([missingInPrefetch, entityGuids]) => [...missingInPrefetch, ...entityGuids].filter(GeneralHelpers.distinct)),
      filter(guids => guids?.length > 0),
      // distinctUntilChanged(GeneralHelpers.arraysEqual),
    );

    const overrides$ = combineLatest([params$, combinedGuids$]).pipe(
      mergeMap(([params, guids]) => this.queryService.getAvailableEntities(queryUrl, true, params, guids).pipe(
        map(data => { return { data, loading: false }; }),
        startWith({ data: {} as QueryStreams, loading: true })
      )),
      map(set => { return { ...set, data: this.transformData(set.data, streamName) } }),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    this.loading$ = combineLatest([all$, overrides$]).pipe(
      map(([all, overrides]) => all.loading || overrides.loading),
    );

    this.data$ = combineLatest([all$, overrides$, prefetch$]).pipe(
      map(([all, overrides, prefetch]) => {
        // data always takes the last unique value in the array (should be most recent)
        const data = [...new Map([...prefetch, ...all.data, ...overrides.data].map(item => [item.Value, item])).values()];
        return data;
      }),
      shareReplay(1),
    );
  }

  destroy(): void {
    this.params$.complete();

    super.destroy();
  }

  params(params: string): void {
    this.params$.next(params);
  }

  transformData(data: QueryStreams, streamName: string): PickerItem[] {
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
    else if (!data[streamName]) {
      const errorItem: PickerItem = {
        Text: this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName,
        Value: null,
        _disableSelect: true,
        _disableDelete: true,
        _disableEdit: true,
      };
      return [errorItem];
    }
    const items: PickerItem[] = data[streamName].map(entity => {
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
}