import { HttpErrorResponse } from "@angular/common/http";
import { EditForm } from "projects/eav-ui/src/app/shared/models/edit-form.model";
import { DeleteEntityProps } from "../models/picker.models";
import { DataAdapterBase } from "./data-adapter-base";
import { FieldMask } from "../../../../shared/helpers";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { EntityService, FormConfigService, EditRoutingService } from "../../../../shared/services";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { StateAdapter } from './state-adapter';
import { DataSourceBase } from '../data-sources/data-source-base';
import { DataSourceEmpty } from '../data-sources/data-source-empty';
import { PickerFeatures } from '../picker-features.model';
import { Injector, computed, inject, signal, untracked } from '@angular/core';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';
import { EntityFormStateService } from '../../../entity-form-state.service';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { PickerItem, messagePickerItem } from '../models/picker-item.model';
import { DataSourceEntityQueryBase } from '../data-sources/data-source-entity-query-base';
import { transient } from 'projects/eav-ui/src/app/core';


export abstract class DataAdapterEntityBase extends DataAdapterBase {

  /** Content Type Mask */
  private typeMaskFromSettings = computed(() => this.fieldState.settings().EntityType, SignalHelpers.stringEquals);

  /**
   * This is a text or mask containing all query parameters.
   * Since it's a mask, it can also contain values from the current item
   */
  private contentTypeMaskLazy = computed(() => {
    const typeMask = this.typeMaskFromSettings();
    // Note: this is a bit ugly, not 100% sure if the cleanup will happen as needed
    let fieldMask: FieldMask;
    untracked(() => {
      fieldMask = transient(FieldMask, this.injector).init('PickerSource-EntityType', typeMask, true);
    });
    return fieldMask;
  });
  

  protected contentType = computed(() => this.contentTypeMaskLazy()?.signal() ?? '', SignalHelpers.stringEquals);

  private createEntityTypes = computed(() => this.fieldState.settings().CreateTypes, SignalHelpers.stringEquals);

  /** The features depend on contentType names being available to support create */
  public features = computed<Partial<PickerFeatures>>(
    () => {
      // if we don't know the content-type, we can't create new entities
      const disableCreate = !this.contentType() && !this.createEntityTypes();
      return { create: !disableCreate } satisfies Partial<PickerFeatures>;
    },
    { equal: RxHelpers.objectsEqual }
  );

  // WIP
  private deletedItemsGuids = signal<string[]>([]);

  private entityService = inject(EntityService);
  protected formConfig = inject(FormConfigService);
  private editRoutingService = inject(EditRoutingService);
  protected translate = inject(TranslateService);
  private snackBar = inject(MatSnackBar);
  protected injector = inject(Injector);

  protected fieldState = inject(FieldState);
  protected group = inject(EntityFormStateService).formGroup();

  /* Error handling to use in the final options - ATM never really used, since we can't really trigger the problem it was meant for */
  protected errorOptions = signal<PickerItem[]>(null);

  /** The options/hints to show in the UI */
  override optionsOrHints = computed(() => {
    const errors = this.errorOptions();
    if (errors) return errors;
    const ds = this.dataSource();
    const deleted = this.deletedItemsGuids();
    const items = ds.data().filter(item => !deleted.some(guid => guid === item.value));
    this.log.a('computing optionsOrHints');
    return ds.loading()
      ? [messagePickerItem(this.translate, 'Fields.Picker.Loading'), ...items]
      : items;
  });

  protected abstract dataSourceEntityOrQuery: DataSourceBase;
  constructor(logSpecs: EavLogger) {
    super(logSpecs);
    this.log.a('constructor');
  }

  public linkLog(log: EavLogger): this {
    if (!this.log.enabled)
      this.log.inherit(log);
    return this;
  };

  public connectState(state: StateAdapter, useEmpty: boolean): this  {
    this.log.a('setupFromComponent');

    this.dataSource.set(useEmpty
      ? transient(DataSourceEmpty, this.injector).preSetup("Error: configuration missing")
      : this.dataSourceEntityOrQuery.setup()
    );
    if (useEmpty) 
      this.useDataSourceStream.set(true);

    super.setup(state.doAfterDelete);
    return this;
  }

  initPrefetch(prefetchGuids: string[]): void {
    (this.dataSource() as DataSourceEntityQueryBase).initPrefetch?.(prefetchGuids);
  }

  forceReloadData(missingData: string[]): void {
    const l = this.log.fn('forceReloadData', { missingData });
    this.dataSource().addToRefresh(missingData);

    
    l.end();
  }


  // private updateAddNew(): void {
  //   this.log.add('updateAddNew');
  //   // const contentTypeName = this.contentTypeMask.resolve();
  //   const disableCreate = !this.contentType() && !this.createEntityTypes();
  //   this.features.update(p => ({ ...p, create: !disableCreate } satisfies Partial<PickerFeatures>));
  // }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void {
    this.log.a('editItem', {editParams});
    if (editParams)
      this.editEntityGuid.set(editParams.entityGuid);
    let form: EditForm;
    if (editParams?.entityGuid == null) {
      const contentTypeName = entityType ?? this.contentType();
      const prefill = this.getPrefill();
      form = {
        items: [{ ContentTypeName: contentTypeName, Prefill: prefill }],
      };
    } else {
      const entity = this.optionsOrHints().find(item => item.value === editParams.entityGuid);
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
    const config = this.fieldState.config;
    this.editRoutingService.open(config.index, config.entityGuid, form);
  }

  deleteItem(props: DeleteEntityProps): void {
    this.log.a('deleteItem', {props});
    const entity = this.optionsOrHints().find(item => item.value === props.entityGuid);
    const id = entity.id;
    const title = entity.label;
    const contentType = this.contentType();
    const config = this.fieldState.config;
    const parentId = config.entityId;
    const parentField = config.fieldName;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open(this.translate.instant('Message.Deleting'));
    this.entityService.delete(contentType, id, false, parentId, parentField).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.deleteCallback(props); // removes value from selected values
        this.deletedItemsGuids.update(p => [...p, props.entityGuid]);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.deleteCallback(props); // removes value from selected values
            this.deletedItemsGuids.update(p => [...p, props.entityGuid]);
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
      const prefillRaw = this.fieldState.settings().Prefill;
      const prefillMask = transient(FieldMask, this.injector).init('Prefill', prefillRaw, false);
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