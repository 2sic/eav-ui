import { EntityForPicker, EntityInfo, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Subscription } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../shared/store/ngrx-data";
import { QueryService } from "../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity } from "../entity/entity-query/entity-query.models";

export class QueryFieldDataSource {
  public data$ = new BehaviorSubject<EntityInfo[]>([]);
  public error$ = new BehaviorSubject('');

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
  ) { }

  destroy(): void {
    this.subscriptions.unsubscribe();
  }

  fetchQueryData(queryUrl: string, includeGuid: boolean, params: string, entitiesFilter: string[], streamName: string): void {
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
        const items: EntityInfo[] = data[streamName].map(entity => {
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
        this.data$.next(items);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    }));
  }

  private queryEntityMapping(entity: QueryEntity): EntityInfo {
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  private stringQueryEntityMapping(entity: QueryEntity): EntityInfo {
    const settings = this.settings$.value;
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity[settings.Value] ? `${entity[settings.Value]}` : entity[settings.Value],
      Text: entity[settings.Label] ? `${entity[settings.Label]}` : entity[settings.Label],
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  private setDisableEdit<T extends EntityForPicker>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => e._disableEdit = e.AppId != null && e.AppId.toString() !== this.appId);
    // console.log('2dm queryEntities', queryEntities, this.eavService.eavConfig.appId);
    return queryEntities;
  }

  /** fill additional properties that are marked in settings.MoreFields and replace tooltip and information placeholders */
  private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: EntityInfo): EntityInfo {
    const settings = this.settings$.value;
    const additionalFields = settings.MoreFields?.split(',') || [];
    let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
    let information = this.cleanStringFromWysiwyg(settings.Information);
    additionalFields.forEach(field => {
      entityInfo[field] = entity[field];
      tooltip = tooltip.replace(`[Item:${field}]`, entity[field]);
      information = information.replace(`[Item:${field}]`, entity[field]);
    });
    entityInfo.Tooltip = tooltip;
    entityInfo.Information = information;
    return entityInfo;
  }

  /** remove HTML tags that come from WYSIWYG */
  private cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }
}