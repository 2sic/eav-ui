import { HttpErrorResponse } from "@angular/common/http";
import { EditForm, EditPrep } from "../../../../../app/shared/models/edit-form.model";
import { DeleteEntityProps } from "../models/picker.models";
import { DataAdapterBase } from "./data-adapter-base";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { PickerFeatures } from '../picker-features.model';
import { Injector, inject, untracked } from '@angular/core';
import { PickerItem, PickerItemFactory } from '../models/picker-item.model';
import { DataSourceEntityQueryBase } from '../data-sources/data-source-entity-query-base';
import { EntityFormStateService } from '../../../entity-form/entity-form-state.service';
import { FieldState } from '../../field-state';
import { FieldMask } from '../../../shared/helpers';
import { transient } from '../../../../core/transient';
import { FormConfigService } from '../../../form/form-config.service';
import { EditRoutingService } from '../../../routing/edit-routing.service';
import { EntityService } from "../../../../../app/shared/services/entity.service";
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { take } from 'rxjs';

export abstract class DataAdapterEntityBase extends DataAdapterBase {

  //#region Services, constructor, log

  protected formConfig = inject(FormConfigService);
  #editRoutingService = inject(EditRoutingService);
  protected translate = inject(TranslateService);
  #snackBar = inject(MatSnackBar);
  protected injector = inject(Injector);
  protected fieldState = inject(FieldState);
  protected group = inject(EntityFormStateService).formGroup;
  #entityService = transient(EntityService);

  protected name = this.fieldState.name;

  //#endregion

  /** Content Type Mask */
  #maskTemplate = computedObj('typeMaskFromSettings', () => this.fieldState.settings().EntityType);

  /**
   * This is a text or mask containing all query parameters.
   * Since it's a mask, it can also contain values from the current item
   */
  #paramsMaskLazy = computedObj('paramsMaskLazy', () => {
    const typeMask = this.#maskTemplate();
    // Note: untracked so that the creation of the mask (which has signals) doesn't trigger additional computations
    const fieldMask = untracked(() => transient(FieldMask, this.injector).init('PickerSource-EntityType', typeMask));
    return fieldMask;
  });


  protected contentType = computedObj('contentType', () => this.#paramsMaskLazy()?.result() ?? '');

  #createEntityTypes = computedObj('createEntityTypes', () => this.fieldState.settings().CreateTypes);

  /** The features depend on contentType names being available to support create */
  public features = computedObj<Partial<PickerFeatures>>('features', () => {
    // if we don't know the content-type, we can't create new entities
    const disableCreate = !this.contentType() && !this.#createEntityTypes();
    return { create: !disableCreate } satisfies Partial<PickerFeatures>;
  });

  // WIP
  #deletedItemsGuids = signalObj<string[]>('deletedItemsGuids', []);

  /* Error handling to use in the final options - ATM never really used, since we can't really trigger the problem it was meant for */
  protected errorOptions = signalObj<PickerItem[]>('errorOptions', null);

  /** The options/hints to show in the UI */
  override optionsOrHints = computedObj('optionsOrHints', () => {
    const errors = this.errorOptions();
    if (errors) return errors;
    const ds = this.dataSource();
    const deleted = this.#deletedItemsGuids();
    const items = ds.data().filter(item => !deleted.some(guid => guid === item.value));
    return ds.loading()
      ? [PickerItemFactory.message(this.translate, 'Fields.Picker.Loading'), ...items]
      : items;
  });

  initPrefetch(prefetchGuids: string[]): void {
    this.syncParams();
    this.log.fnIfInList('initPrefetch', 'fields', this.name, { prefetchGuids });
    (this.dataSource() as DataSourceEntityQueryBase).initPrefetch?.(prefetchGuids);
  }

  forceReloadData(missingData: string[]): void {
    const l = this.log.fn('forceReloadData', { missingData });
    this.dataSource().addToRefresh(missingData);
    l.end();
  }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void {
    const l = this.log.fn('editItem', { editParams });
    const editGuid = editParams?.entityGuid;
    const form: EditForm = {
      items: (editGuid == null)
        ? [EditPrep.newFromType(entityType ?? this.contentType(), this.#getPrefill())]
        : [EditPrep.editId(this.optionsOrHints().find(item => item.value === editGuid)?.id ?? editParams.entityId)]
    };
    const config = this.fieldState.config;
    
    // Open the form
    this.#editRoutingService.open(config.index, config.entityGuid, form);

    // Monitor for close to reload data
    this.#editRoutingService.childFormClosed()
      .pipe(take(1))
      .subscribe(data => {
        const l2 = this.log.fn('childFormClosed', { editGuid, data });
        if (editGuid) {
          this.forceReloadData([editGuid]);
          return l2.end('forceReloadData', { editGuid });
        }
        l2.end("no guid, won't reload data");
      })
    l.end();
  }

  deleteItem(props: DeleteEntityProps): void {
    this.log.a('deleteItem', { props });
    const entity = this.optionsOrHints().find(item => item.value === props.entityGuid);
    const id = entity.id;
    const title = entity.label;
    const contentType = this.contentType();
    const config = this.fieldState.config;
    const parentId = config.entityId;
    const parentField = config.fieldName;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) return;

    this.#snackBar.open(this.translate.instant('Message.Deleting'));
    this.#entityService.delete(this.formConfig.config.appId, contentType, id, false, parentId, parentField).subscribe({
      next: () => {
        this.#snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.deleteCallback(props); // removes value from selected values
        this.#deletedItemsGuids.update(p => [...p, props.entityGuid]);
      },
      error: (error1: HttpErrorResponse) => {
        this.#snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) return;
        this.#snackBar.open(this.translate.instant('Message.Deleting'));
        this.#entityService.delete(this.formConfig.config.appId, contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.#snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.deleteCallback(props); // removes value from selected values
            this.#deletedItemsGuids.update(p => [...p, props.entityGuid]);
          },
          error: (error2: HttpErrorResponse) => {
            this.#snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
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
  #getPrefill(): Record<string, string> {
    this.log.a('getPrefill');
    // still very experimental, and to avoid errors try to catch any mistakes
    try {
      const prefillRaw = this.fieldState.settings().Prefill;
      const prefillMask = transient(FieldMask, this.injector).init('Prefill', prefillRaw);
      const prefill = prefillMask.result();
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

export interface LogSpecsDataAdapterEntityBase {
  all: boolean;
  connectState: boolean;
}