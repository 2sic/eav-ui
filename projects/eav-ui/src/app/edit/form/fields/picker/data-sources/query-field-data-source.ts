import { EntityForPicker, WIPDataSourceItem, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, Observable, Subscription, combineLatest, distinctUntilChanged, filter, map, startWith, tap } from "rxjs";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { QueryService } from "../../../../shared/services";
import { TranslateService } from "@ngx-translate/core";
import { QueryEntity } from "../../entity/entity-query/entity-query.models";
import { GeneralHelpers } from "../../../../shared/helpers";

export class QueryFieldDataSource {
  public data$: Observable<WIPDataSourceItem[]>;
  public error$ = new BehaviorSubject('');

  private includeGuid$ = new BehaviorSubject<boolean>(true);
  private params$ = new BehaviorSubject<string>('');
  private entityGuids$ = new BehaviorSubject<string[]>(null);
  private getAll$ = new BehaviorSubject<boolean>(false);
  private prefetch$ = new BehaviorSubject<boolean>(false);
  private loading$ = new BehaviorSubject<boolean>(false);
  private trigger$ = new BehaviorSubject<boolean[]>([false, false]);
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
    this.subscriptions.add(
      combineLatest([
        this.getAll$.pipe(
          // distinctUntilChanged(),
          filter(getAll => !!getAll), // trigger only on truthy values
          startWith(false),
          // tap(value => console.log('SDV query getAll$', value))
        ),
        this.prefetch$.pipe(
          // distinctUntilChanged(),
          filter(prefetch => !!prefetch), // trigger only on truthy values
          startWith(false),
          // tap(value => console.log('SDV query prefetch$', value))
        ),
      ]).pipe(
        // tap(([getAll, prefetch]) => console.log('SDV query trigger', getAll, prefetch)),
        map(([getAll, prefetch]) => [getAll, prefetch])
      ).subscribe(this.trigger$)
    );

    this.data$ = combineLatest([
      this.trigger$.pipe(
        // distinctUntilChanged(GeneralHelpers.arraysEqual), // only if we don't want to trigger on every getAll
        // tap(() => console.log('SDV query trigger$'))
      ),
      this.entityCacheService.getEntities$().pipe(
        distinctUntilChanged(GeneralHelpers.arraysEqual),
        // tap(() => console.log('SDV query entityCache$'))
      ),
      this.stringQueryCacheService.getEntities$(this.entityGuid, this.fieldName).pipe(
        distinctUntilChanged(GeneralHelpers.arraysEqual),
        // tap(() => console.log('SDV query stringQueryCache$'))
      ),
    ])
      .pipe(map(([trigger, entityQuery, stringQuery]) => {
        const data = this.isStringQuery ?
          stringQuery.map(entity => this.stringQueryEntityMapping(entity))
          : entityQuery;
        if (trigger[0] && this.loading$.value === false) {
          this.fetchData(this.includeGuid$.value, this.params$.value, []);
        } else if (trigger[1] && this.loading$.value === false) {
          this.fetchData(this.includeGuid$.value, this.params$.value, this.entityGuids$.value);
        }
        return data;
      })//, distinctUntilChanged(GeneralHelpers.arraysEqual)
      );
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

  prefetch(contentType?: string, entityGuids?: string[]): void {
    this.params(contentType);
    this.entityGuids(entityGuids);
    this.prefetch$.next(true);
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
        this.loading$.next(false);
        this.trigger$.next([false, false]);
        this.getAll$.next(false);
        this.prefetch$.next(false);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
        this.loading$.next(false);
        this.trigger$.next([false, false]);
        this.getAll$.next(false);
        this.prefetch$.next(false);
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