import { EntityForPicker, WIPDataSourceItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, map } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";

export class QueryFieldDataSource {
  public data$: Observable<WIPDataSourceItem[]>;
  public error$ = new BehaviorSubject('');

  public includeGuid$ = new BehaviorSubject<boolean>(true);
  public params$ = new BehaviorSubject<string>('');
  public entityGuids$ = new BehaviorSubject<string[]>(null);

  private getAll$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(null);

  private subscriptions = new Subscription();

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
    this.data$ = combineLatest([
      this.includeGuid$,
      this.params$,
      this.entityGuids$,
      this.getAll$,
      this.loading$,
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(this.entityGuid, this.fieldName)
    ])
      .pipe(map(([includeGuid, params, entityGuids, getAll, loading, entityQuery, stringQuery]) => {
        const data = this.isStringQuery ?
          stringQuery.map(entity => this.stringQueryEntityMapping(entity))
          : entityQuery;
        if (getAll && loading == null) {
          this.fetchData(includeGuid, params, entityGuids);
          return data;
        }
        return data;
      }));
  }

  destroy(): void {
    this.error$.complete();
    this.includeGuid$.complete();
    this.params$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.loading$.complete();

    this.subscriptions.unsubscribe();
  }

  getAll(): void {
    this.getAll$.next(true);
  }

  includeGuid(includeGuid: boolean): void {
    this.includeGuid$.next(includeGuid);
  }

  params(params: string): void {
    this.params$.next(params);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  fetchData(includeGuid: boolean, params: string, entitiesFilter: string[]): void {
    const settings = this.settings$.value;
    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    this.loading$.next(true);

    this.subscriptions.add(this.queryService.getAvailableEntities(queryUrl, includeGuid, params, entitiesFilter).subscribe({
      next: (data) => {
        if (!data) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[streamName]) {
          this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName);
          return;
        }
        const items: WIPDataSourceItem[] = data[streamName].map(entity => {
          return this.isStringQuery ? this.stringQueryEntityMapping(entity) : this.queryEntityMapping(entity)
        });
        if (!this.isStringQuery) {
          const entities = this.setDisableEdit(items);
          this.entityCacheService.loadEntities(entities);
        } else {
          // If the data belongs to another app, mark it as not editable
          const entities = this.setDisableEdit(data[streamName]);
          this.stringQueryCacheService.loadEntities(this.entityGuid, this.fieldName, entities);
        }
        // this.loaded$.next(true);
        this.loading$.next(false);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    }));
  }

  private queryEntityMapping(entity: QueryEntity): WIPDataSourceItem {
    const entityInfo: WIPDataSourceItem = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  private stringQueryEntityMapping(entity: QueryEntity): WIPDataSourceItem {
    const settings = this.settings$.value;
    const entityInfo: WIPDataSourceItem = {
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
  private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: WIPDataSourceItem): WIPDataSourceItem {
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