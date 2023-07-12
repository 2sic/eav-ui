import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService, QueryService } from "../../../shared/services";
import { EntityCacheService, StringQueryCacheService } from "../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapter } from "./picker-source-adapter";
import { DeleteEntityProps } from "./picker.models";
import { filterGuids } from "./picker.helpers";
import { FieldMask } from "../../../shared/helpers/field-mask.helper";
import { GeneralHelpers } from "../../../shared/helpers";
import { FieldDataSourceFactoryService } from "./field-data-source-factory.service";
import { QueryFieldDataSource } from "./query-field-data-source";

export class PickerQuerySourceAdapter extends PickerSourceAdapter {
  private queryFieldDataSource: QueryFieldDataSource;

  constructor(
    public error$: BehaviorSubject<string> = new BehaviorSubject(''),

    public fieldsSettingsService: FieldsSettingsService,
    public queryService: QueryService,
    public stringQueryCacheService: StringQueryCacheService,

    public isStringQuery: boolean,

    // Below this is needed for base class
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),

    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService,

    protected config: FieldConfigSet,
    protected group: FormGroup,

    public snackBar: MatSnackBar,
    public control: AbstractControl,

    // public fetchAvailableEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) {
    super(
      settings$,
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      config,
      group,
      snackBar,
      control,
      // fetchAvailableEntities,
      deleteCallback,
    );
  }

  paramsMask: FieldMask;

  init(): void {
    super.init();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.UrlParameters),
        distinctUntilChanged(),
      ).subscribe(urlParameters => {
        this.paramsMask?.destroy();
        this.paramsMask = new FieldMask(
          urlParameters,
          this.group.controls,
          () => { this.availableEntities$.next(null); },
          null,
          this.eavService.eavConfig,
        );

        this.availableEntities$.next(null);
      })
    );

    this.queryFieldDataSource = this.fieldDataSourceFactoryService.createQueryFieldDataSource(
      this.settings$,
      this.isStringQuery,
      this.config.entityGuid,
      this.config.fieldName,
      this.eavService.eavConfig.appId,
    );

    this.flushAvailableEntities();
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.contentType = this.paramsMask.resolve();
  }

  destroy(): void {
    this.paramsMask?.destroy();
    this.error$.complete();
    this.queryFieldDataSource.destroy();
    super.destroy();
  }

  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.availableEntities$.next(null);
    }

    const settings = this.settings$.value;
    if (!settings.Query) {
      alert(`No query defined for ${this.config.fieldName} - can't load entities`);
      this.availableEntities$.next([]);
      return;
    }

    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    const params = this.paramsMask.resolve();
    const entitiesFilter: string[] = clearAvailableEntitiesAndOnlyUpdateCache && !this.isStringQuery
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;

    // this.queryService.getAvailableEntities(queryUrl, true, params, entitiesFilter).subscribe({
    //   next: (data) => {
    //     if (!data) {
    //       this.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
    //       return;
    //     }
    //     if (!data[streamName]) {
    //       this.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName);
    //       return;
    //     }
    //     const items: EntityInfo[] = data[streamName].map(entity => {
    //       return this.isStringQuery ? this.stringQueryEntityMapping(entity) : this.queryEntityMapping(entity)
    //     });
    //     if (!this.isStringQuery) {
    //       const entities = this.setDisableEdit(items);
    //       this.entityCacheService.loadEntities(entities);
    //     } else {
    //       // If the data belongs to another app, mark it as not editable
    //       const entities = this.setDisableEdit(data[streamName]);
    //       this.stringQueryCacheService.loadEntities(this.config.entityGuid, this.config.fieldName, entities);
    //     }
    //     if (!clearAvailableEntitiesAndOnlyUpdateCache) {
    //       this.availableEntities$.next(items);
    //     }
    //   },
    //   error: (error) => {
    //     console.error(error);
    //     console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
    //   }
    // });
    this.queryFieldDataSource.fetchQueryData(queryUrl, true, params, entitiesFilter, streamName);
    this.queryFieldDataSource.error$.subscribe(this.error$);
    if (!clearAvailableEntitiesAndOnlyUpdateCache) {
      this.queryFieldDataSource.data$.subscribe(this.availableEntities$);
    }

  }

  // private setDisableEdit<T extends EntityForPicker>(queryEntities: T[]): T[] {
  //   if (queryEntities)
  //     queryEntities.forEach(e => e._disableEdit = e.AppId != null && e.AppId.toString() !== this.eavService.eavConfig.appId);
  //   // console.log('2dm queryEntities', queryEntities, this.eavService.eavConfig.appId);
  //   return queryEntities;
  // }

  // queryEntityMapping(entity: QueryEntity): EntityInfo {
  //   const entityInfo: EntityInfo = {
  //     Id: entity.Id,
  //     Value: entity.Guid,
  //     Text: entity.Title,
  //   };
  //   return this.fillEntityInfoMoreFields(entity, entityInfo);
  // }

  // stringQueryEntityMapping(entity: QueryEntity): EntityInfo {
  //   const settings = this.settings$.value;
  //   const entityInfo: EntityInfo = {
  //     Id: entity.Id,
  //     Value: entity[settings.Value] ? `${entity[settings.Value]}` : entity[settings.Value],
  //     Text: entity[settings.Label] ? `${entity[settings.Label]}` : entity[settings.Label],
  //   };
  //   return this.fillEntityInfoMoreFields(entity, entityInfo);
  // }

  flushAvailableEntities(): void { 
    if (!this.isStringQuery) {
      this.subscription.add(
        this.settings$.pipe(
          map(settings => ({
            Query: settings.Query,
            StreamName: settings.StreamName,
          })),
          distinctUntilChanged(GeneralHelpers.objectsEqual),
        ).subscribe(() => {
          this.availableEntities$.next(null);
        })
      );
    } else {
      this.subscription.add(
        this.settings$.pipe(
          map(settings => ({
            Value: settings.Value,
            Label: settings.Label,
          })),
          distinctUntilChanged(GeneralHelpers.objectsEqual),
        ).subscribe(() => {
          this.availableEntities$.next(null);
        })
      );
    }
  }
}