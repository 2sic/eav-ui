// import { EntityInfo } from "projects/edit-types";
// import { BehaviorSubject } from "rxjs";
// import { EntityCacheService } from "../../../shared/store/ngrx-data";
// import { QueryService } from "../../../shared/services";
// import { TranslateService } from "@ngx-translate/core";
// import { QueryEntity } from "../entity/entity-query/entity-query.models";

// export class QueryFieldDataSource {
//   public data$ = new BehaviorSubject<EntityInfo[]>([]);
//   public error$ = new BehaviorSubject('');

//   constructor(
//     private queryService: QueryService,
//     private entityCacheService: EntityCacheService,
//     private translate: TranslateService,
//   ) { }

//   fetchStringData(queryUrl: string, includeGuid: boolean, params: string, entitiesFilter: string[], streamName: string, settings: any): void {
//     this.queryService.getAvailableEntities(queryUrl, true, params, entitiesFilter).subscribe({
//       next: (data) => {
//         if (!data) {
//           this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
//           return;
//         }
//         if (!data[streamName]) {
//           this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName);
//           return;
//         }
//         const items: EntityInfo[] = data[streamName].map(entity => {
//           return this.isStringQuery ? this.stringQueryEntityMapping(entity, settings) : this.queryEntityMapping(entity, settings)
//         });
//         if (!this.isStringQuery) {
//           const entities = this.setDisableEdit(items);
//           this.entityCacheService.loadEntities(entities);
//         } else {
//           // If the data belongs to another app, mark it as not editable
//           const entities = this.setDisableEdit(data[streamName]);
//           this.stringQueryCacheService.loadEntities(this.config.entityGuid, this.config.fieldName, entities);
//         }
//         if (!clearAvailableEntitiesAndOnlyUpdateCache) {
//           this.availableEntities$.next(items);
//         }
//       },
//       error: (error) => {
//         console.error(error);
//         console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
//       }
//     });
//   }

//   private queryEntityMapping(entity: QueryEntity, settings: any): EntityInfo {
//     const entityInfo: EntityInfo = {
//       Id: entity.Id,
//       Value: entity.Guid,
//       Text: entity.Title,
//     };
//     return this.fillEntityInfoMoreFields(entity, entityInfo, settings);
//   }

//   private stringQueryEntityMapping(entity: QueryEntity, settings: any): EntityInfo {
//     // const settings = this.settings$.value;
//     const entityInfo: EntityInfo = {
//       Id: entity.Id,
//       Value: entity[settings.Value] ? `${entity[settings.Value]}` : entity[settings.Value],
//       Text: entity[settings.Label] ? `${entity[settings.Label]}` : entity[settings.Label],
//     };
//     return this.fillEntityInfoMoreFields(entity, entityInfo, settings);
//   }

//   /** fill additional properties that are marked in settings.MoreFields and replace tooltip and information placeholders */
//   private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: EntityInfo, settings: any): EntityInfo {
//     // const settings = this.settings$.value;
//     const additionalFields = settings.MoreFields?.split(',') || [];
//     let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
//     let information = this.cleanStringFromWysiwyg(settings.Information);
//     additionalFields.forEach(field => {
//       entityInfo[field] = entity[field];
//       tooltip = tooltip.replace(`[Item:${field}]`, entity[field]);
//       information = information.replace(`[Item:${field}]`, entity[field]);
//     });
//     entityInfo.Tooltip = tooltip;
//     entityInfo.Information = information;
//     return entityInfo;
//   }

// }