import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Subject, combineLatest, distinctUntilChanged, filter, map, mergeMap, shareReplay, startWith } from "rxjs";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { GeneralHelpers } from "../../../../shared/helpers";
import { DataSourceBase } from './data-source-base';
import { QueryService } from "../../../../shared/services";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";

export class EntityFieldDataSource extends DataSourceBase {
  private contentTypeName$ = new Subject<string>();

  constructor(
    protected settings$: BehaviorSubject<FieldSettings>,
    private queryService: QueryService,
    private entityCacheService: EntityCacheService,
  ) {
    super(settings$);

    const typeName$ = this.contentTypeName$.pipe(distinctUntilChanged(), shareReplay(1));

    const all$ = combineLatest([
      typeName$,
      this.getAll$.pipe(distinctUntilChanged(), filter(getAll => !!getAll)),
    ]).pipe(
      mergeMap(([typeName, _]) => this.queryService.getEntities([typeName], [], this.calculateMoreFields()).pipe(
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
      mergeMap(([typeName, guids]) => queryService.getEntities([typeName], guids, this.calculateMoreFields()).pipe(
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

  /** fill additional properties */
  private fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: PickerItem): PickerItem {
    const settings = this.settings$.value;
    let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
    let information = this.cleanStringFromWysiwyg(settings.Information);
    Object.keys(entity).forEach(key => { 
      //this is because we use Value and Text as properties in PickerItem
      if(key !== 'Value' && key !== 'Text')
        entityInfo["_"+key] = entity[key];
      else
        entityInfo[key] = entity[key];
      tooltip = tooltip.replace(`[Item:${key}]`, entity[key]);
      information = information.replace(`[Item:${key}]`, entity[key]);
    });
    entityInfo._tooltip = tooltip;
    entityInfo._information = information;
    return entityInfo;
  }
}