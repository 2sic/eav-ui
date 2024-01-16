import { PickerItem } from "projects/edit-types";
import { Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from "rxjs";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { QueryService } from "../../../../shared/services";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();

  constructor(
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
  ) {
    super();

    const typeName$ = this.contentTypeName$.pipe(distinctUntilChanged(), shareReplay(1));

    const all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      mergeMap(([typeName, _]) => this.queryService.getEntities([typeName], []).pipe(
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        startWith({ data: [] as PickerItem[], loading: true })
      )),
      startWith({ data: [] as PickerItem[], loading: false }),
      shareReplay(1),
    );

    const prefetch$ = this.prefetchEntityGuids$.pipe(
      distinctUntilChanged(),
      filter(entityGuids => entityGuids?.length > 0),
      mergeMap(entityGuids => this.entityCacheService.getEntities$(entityGuids)),
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

    const overrides$ = combineLatest([typeName$, combinedGuids$]).pipe(
      mergeMap(([typeName, guids]) => queryService.getEntities([typeName], guids).pipe(
        map(data => {
          const items: PickerItem[] = data["Default"].map(entity => {
            return this.queryEntityMapping(entity)
          });
          return { data: items, loading: false };
        }),
        startWith({ data: [] as PickerItem[], loading: true })
      )),
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
    this.contentTypeName$.complete();
    
    super.destroy();
  }

  contentType(contentTypeName: string): void {
    this.contentTypeName$.next(contentTypeName);
  }

  entityGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  private queryEntityMapping(entity: QueryEntity): PickerItem {
    const entityInfo: PickerItem = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return this.fillEntityInfoMoreFields(entity, entityInfo);
  }

  /** fill additional properties that are marked in settings.MoreFields and replace tooltip and information placeholders */
  private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: PickerItem): PickerItem {
    // const settings = this.settings$.value;
    // const additionalFields = settings.MoreFields?.split(',') || [];
    // let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
    // let information = this.cleanStringFromWysiwyg(settings.Information);
    // additionalFields.forEach(field => {
    //   entityInfo[field] = entity[field];
    //   tooltip = tooltip.replace(`[Item:${field}]`, entity[field]);
    //   information = information.replace(`[Item:${field}]`, entity[field]);
    // });
    // entityInfo._tooltip = tooltip;
    // entityInfo._information = information;
    Object.keys(entity).forEach(key => { //TODO: @SDV check for Value and Text keys
      entityInfo[key] = entity[key];
    });
    return entityInfo;
  }

  /** remove HTML tags that come from WYSIWYG */
  // private cleanStringFromWysiwyg(wysiwygString: string): string {
  //   const div = document.createElement("div");
  //   div.innerHTML = wysiwygString ?? '';
  //   return div.innerText || '';
  // }
}