import { HttpErrorResponse } from "@angular/common/http";
import { EditForm } from "projects/eav-ui/src/app/shared/models/edit-form.model";
import { DeleteEntityProps } from "../models/picker.models";
import { DataAdapterBase } from "./data-adapter-base";
import { FieldMask } from "../../../../shared/helpers";
import { BehaviorSubject, Observable, distinctUntilChanged, map } from "rxjs";
import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { EntityService, FormConfigService, EditRoutingService } from "../../../../shared/services";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapter } from './state-adapter';
import { PickerComponent } from '../picker.component';
import { DataSourceBase } from '../data-sources/data-source-base';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { DataSourceEmpty } from '../data-sources/data-source-empty';

export abstract class DataAdapterEntityBase extends DataAdapterBase {
  private createEntityTypes: string = '';
  protected contentTypeMask: FieldMask;
  protected contentType: string;
  protected deletedItemGuids$ = new BehaviorSubject<string[]>([]);

  protected useEmpty: boolean = false;

  protected dataSource: DataSourceBase;

  constructor(
    protected entityCacheService: PickerDataCacheService,  // DI
    protected entityService: EntityService, // DI
    protected formConfig: FormConfigService, // DI
    protected editRoutingService: EditRoutingService, // DI
    protected translate: TranslateService, // DI
    protected snackBar: MatSnackBar,
    private dataSourceEntity: DataSourceBase,
    private dataSourceEmpty: DataSourceEmpty,
    logSpecs: EavLogger,
  ) {
    super(logSpecs);
    this.log.a('constructor');
  }

  disableAddNew$: BehaviorSubject<boolean>;
  settings$: BehaviorSubject<FieldSettings>;
  protected config: FieldConfigSet;
  protected group: FormGroup;
  public control: AbstractControl;

  public setupFromComponent(
    component: PickerComponent,
    state: StateAdapter,
    useEmpty: boolean,
  ): this  {
    this.log.a('setupFromComponent');
    if (!this.log.enabled)
      this.log.inherit(component.log);

    this.dataSource = useEmpty
      ? this.dataSourceEmpty.setup(component.settings$)
      : this.dataSourceEntity.setup(component.settings$);

    return this.setupShared(
      component.settings$,
      component.config,
      component.group,
      component.control,
      state.disableAddNew$,
      (props: DeleteEntityProps) => state.doAfterDelete(props),
    );
  }

  private setupShared(
    settings$: BehaviorSubject<FieldSettings>,
    config: FieldConfigSet,
    group: FormGroup,
    control: AbstractControl,
    disableAddNew$: BehaviorSubject<boolean>,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): this {
    this.log.a('setupShared');
    this.settings$ = settings$;
    this.config = config;
    this.group = group;
    this.control = control;
    this.disableAddNew$ = disableAddNew$;
    super.setup(deleteCallback);
    return this;
  }

  init(callerName: string): void {
    super.init(callerName);
    // Update/Build Content-Type Mask which is used for loading the data/new etc.
    this.subscriptions.add(
      this.settings$.pipe(
        map(settings => ({
          EntityType: settings.EntityType,
          CreateEntityTypes: settings.CreateTypes,
        })),
        distinctUntilChanged(RxHelpers.objectsEqual),
      ).subscribe(settings => {
        this.createEntityTypes = settings.CreateEntityTypes;
        this.log.a('about to create contentTypeMask');
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMask(
          settings.EntityType,
          this.group.controls,
          () => {
            // 2024-06-06 2dm temp - the function isn't used,
            // but the mask only watches if it gets a function for now
            // this.optionsOrHints$.next(null);
            // this.updateAddNew();
          },
          null,
          this.formConfig.config,
          this.config,
          'PickerSource-EntityType',
          true, // override log
        );

        // watch for changes
        this.subscriptions.add(
          this.contentTypeMask.value$.subscribe(contentType => {
            this.contentType = contentType;
            this.optionsOrHints$.next(null);
            this.updateAddNew();
            this.log.a(`contentTypeMask.value$:'${contentType}'`);
          })
        );
        this.optionsOrHints$.next(null);
        this.updateAddNew();
      })
    );
  }


  getDataFromSource(): Observable<PickerItem[]> {
    return this.dataSource.data$;
  }

  initPrefetch(prefetchGuids: string[]): void {
    this.dataSource.initPrefetch(prefetchGuids);
  }

  forceReloadData(missingData: string[]): void {
    this.dataSource.addToRefresh(missingData);
  }




  destroy(): void {
    this.settings$.complete();
    this.dataSource.destroy();
    super.destroy();
  }

  onAfterViewInit(): void {
    this.log.a('onAfterViewInit');
    // this.contentType = this.contentTypeMask.resolve();
  }

  updateAddNew(): void {
    this.log.a('updateAddNew');
    // const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!this.contentType && !this.createEntityTypes);
  }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void {
    this.log.a('editItem', [editParams]);
    if (editParams)
      this.editEntityGuid$.next(editParams.entityGuid);
    let form: EditForm;
    if (editParams?.entityGuid == null) {
      const contentTypeName = entityType ?? this.contentType;
      const prefill = this.getPrefill();
      form = {
        items: [{ ContentTypeName: contentTypeName, Prefill: prefill }],
      };
    } else {
      const entity = this.optionsOrHints$.value.find(item => item.value === editParams.entityGuid);
      // if (entity != null) {
      //   form = {
      //     items: [{ EntityId: entity.id }],
      //   };
      // } else {
      //   form = {
      //     items: [{ EntityId: editParams.entityId }],
      //   };
      // }
      form = {
        items: [{ EntityId: entity?.id ?? editParams.entityId }],
      };
    }
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  deleteItem(props: DeleteEntityProps): void {
    this.log.a('deleteItem', [props]);
    const entity = this.optionsOrHints$.value.find(item => item.value === props.entityGuid);
    const id = entity.id;
    const title = entity.label;
    const contentType = this.contentType;
    const parentId = this.config.entityId;
    const parentField = this.config.fieldName;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open(this.translate.instant('Message.Deleting'));
    this.entityService.delete(contentType, id, false, parentId, parentField).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.deleteCallback(props); // removes value from selected values
        this.deletedItemGuids$.next([...this.deletedItemGuids$.value, props.entityGuid]);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.deleteCallback(props); // removes value from selected values
            this.deletedItemGuids$.next([...this.deletedItemGuids$.value, props.entityGuid]);
          },
          error: (error2: HttpErrorResponse) => {
            this.snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
          }
        });
      }
    });
  }

  /**
   * Will create a prefill object (if configured) which is based on a field-mask.
   * This allows create-entity to use add prefills.
   * ATM just normal values (text/number) or placeholders like [Title] work.
   * In future we may add more features like dates etc.
   * new 11.11.03
   */
  private getPrefill(): Record<string, string> {
    this.log.a('getPrefill');
    // still very experimental, and to avoid errors try to catch any mistakes
    try {
      const prefillMask = new FieldMask(this.settings$.value.Prefill, this.group.controls, null, null, this.formConfig.config,
        null,
        'LogPrefill');
      const prefill = prefillMask.resolve();
      prefillMask.destroy();
      if (!prefill || !prefill.trim()) { return null; }
      const result: Record<string, string> = {};
      prefill.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length === 2 && parts[0] && parts[1]) {
          result[parts[0]] = parts[1];
        }
      });
      return result;
    } catch {
      console.error('Error in getting Prefill for new entity. Will skip prefill.');
      return null;
    }
  }
}