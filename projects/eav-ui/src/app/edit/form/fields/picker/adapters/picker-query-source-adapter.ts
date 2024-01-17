import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, combineLatest, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService, QueryService } from "../../../../shared/services";
import { EntityCacheService, StringQueryCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { DeleteEntityProps } from "../picker.models";
import { FieldMask } from "../../../../shared/helpers/field-mask.helper";
import { GeneralHelpers } from "../../../../shared/helpers";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { QueryFieldDataSource } from "../data-sources/query-field-data-source";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";

export class PickerQuerySourceAdapter extends PickerSourceEntityAdapterBase {
  private paramsMask: FieldMask;
  private queryFieldDataSource: QueryFieldDataSource;

  constructor(
    public error$: BehaviorSubject<string> = new BehaviorSubject(''),
    public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true),

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

    // public fetchAvailableEntities: (clearAvailableItemsAndOnlyUpdateCache: boolean) => void,
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) {
    super(
      disableAddNew$,
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

  init(): void {
    super.init();

    this.subscriptions.add(
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
          this.config,
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

    this.subscriptions.add(combineLatest([
      this.queryFieldDataSource.data$,
      this.queryFieldDataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe({
      next: ([data, loading, deleted]) => {
        const items = data.filter(item => !deleted.some(guid => guid === item.Value));
        if (loading) {
          this.availableItems$.next([{
            Text: this.translate.instant('Fields.Entity.Loading'),
            Value: null,
            _disableSelect: true,
            _disableDelete: true,
            _disableEdit: true,
          }, ...items]);
        } else {
          this.availableItems$.next(items);
        }
      }, error: (error) => {
        this.availableItems$.next([{
          Text: this.translate.instant('Fields.EntityQuery.QueryError') + "-" + error.data,
          Value: null,
          _disableSelect: true,
          _disableDelete: true,
          _disableEdit: true,
        }]);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.queryFieldDataSource.params(this.paramsMask.resolve());
  }

  destroy(): void {
    this.paramsMask?.destroy();
    this.error$.complete();
    this.queryFieldDataSource.destroy();
    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.queryFieldDataSource.data$;
  }

  setPrefetchData(missingData: string[]): void {
    this.queryFieldDataSource.prefetchEntityGuids(missingData);
  }

  setOverrideData(missingData: string[]): void {
    this.queryFieldDataSource.entityGuids(missingData);
  }

  fetchItems(): void {
    this.queryFieldDataSource.params(this.paramsMask.resolve());
    const settings = this.settings$.value;
    if (!settings.Query) {
      const errorItem: PickerItem = {
        Text: this.translate.instant('Fields.EntityQuery.QueryNotDefined'),
        Value: null,
        _disableSelect: true,
        _disableDelete: true,
        _disableEdit: true,
      };
      this.availableItems$.next([errorItem]);
      return;
    }

    this.queryFieldDataSource.getAll();
  }

  flushAvailableEntities(): void {
    if (!this.isStringQuery) {
      this.subscriptions.add(
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
      this.subscriptions.add(
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