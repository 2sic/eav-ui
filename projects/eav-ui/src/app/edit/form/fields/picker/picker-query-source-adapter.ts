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
          () => { this.availableItems$.next(null); },
          null,
          this.eavService.eavConfig,
        );

        this.availableItems$.next(null);
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

  fetchItems(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.availableItems$.next(null);
    }

    const settings = this.settings$.value;
    if (!settings.Query) {
      alert(`No query defined for ${this.config.fieldName} - can't load entities`);
      this.availableItems$.next([]);
      return;
    }

    const params = this.paramsMask.resolve();
    const entitiesFilter: string[] = clearAvailableEntitiesAndOnlyUpdateCache && !this.isStringQuery
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;

    this.queryFieldDataSource.fetchQueryData(true, params, entitiesFilter);
    this.queryFieldDataSource.error$.subscribe(this.error$);
    if (!clearAvailableEntitiesAndOnlyUpdateCache) {
      this.queryFieldDataSource.data$.subscribe(this.availableItems$);
    }

  }

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
          this.availableItems$.next(null);
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
          this.availableItems$.next(null);
        })
      );
    }
  }
}