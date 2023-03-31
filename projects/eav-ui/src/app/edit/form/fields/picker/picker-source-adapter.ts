import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core/public_api';
import { EditForm } from 'projects/eav-ui/src/app/shared/models/edit-form.model';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, distinctUntilChanged, map, Subscription } from 'rxjs';
import { FieldMask } from '../../../shared/helpers';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { PickerAdapterBase } from './picker-adapter-base';
import { convertValueToArray } from './picker.helpers';
import { DeleteEntityProps } from './picker.models';

export class PickerSourceAdapter extends PickerAdapterBase {
  eavService: EavService;
  entityCacheService: EntityCacheService;
  entityService: EntityService;
  editRoutingService: EditRoutingService;
  translate: TranslateService;
  contentType: string;
  snackBar: MatSnackBar;
  isQuery: boolean;

  constructor() {
    super();
   }
  private subscriptions = new Subscription();
  availableEntities$: BehaviorSubject<EntityInfo[]> = new BehaviorSubject<EntityInfo[]>(null);

  group: FormGroup;

  init() { }

  destroy() {
    super.destroy();

    this.availableEntities$.complete();

    this.subscriptions.unsubscribe();
  }

  fetchAvailableEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean) { }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editEntity(editParams: { entityGuid: string, entityId: number }): void {
    let form: EditForm;
    if (editParams?.entityGuid == null) {
      const contentTypeName = this.contentType;
      const prefill = this.getPrefill();
      form = {
        items: [{ ContentTypeName: contentTypeName, Prefill: prefill }],
      };
    } else {
      const entity = this.entityCacheService.getEntity(editParams.entityGuid);
      if (entity != null) {
        form = {
          items: [{ EntityId: entity.Id }],
        };
      } else {
        form = {
          items: [{ EntityId: editParams.entityId }],
        };
      }
    }
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  deleteEntity(props: DeleteEntityProps): void {
    const entity = this.entityCacheService.getEntity(props.entityGuid);
    const id = entity.Id;
    const title = entity.Text;
    const contentType = this.contentType;
    const parentId = this.config.entityId;
    const parentField = this.config.fieldName;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open(this.translate.instant('Message.Deleting'));
    this.entityService.delete(contentType, id, false, parentId, parentField).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.updateValue('delete', props.index);
        this.fetchAvailableEntities(true);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.updateValue('delete', props.index);
            this.fetchAvailableEntities(true);
          },
          error: (error2: HttpErrorResponse) => {
            this.snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
          }
        });
      }
    });
  }

  /**
   * If guid is initially in value, but not in cache, it is either prefilled or entity is deleted,
   * or in case of StringDropdownQuery, backend doesn't provide entities initially.
   * This will fetch data once to figure out missing guids.
   */
  fixPrefillAndStringQueryCache(): void {
    // filter out null items
    const guids = convertValueToArray(this.control.value, this.settings$.value.Separator)
      .filter(guid => !!guid);
    if (guids.length === 0) { return; }

    const cached = this.entityCacheService.getEntities(guids);
    if (guids.length !== cached.length) {
      this.fetchAvailableEntities(true);
    }
  }

  /**
   * Will create a prefill object (if configured) which is based on a field-mask.
   * This allows create-entity to use add prefills.
   * ATM just normal values (text/number) or placeholders like [Title] work.
   * In future we may add more features like dates etc.
   * new 11.11.03
   */
  private getPrefill(): Record<string, string> {
    // still very experimental, and to avoid errors try to catch any mistakes
    try {
      const prefillMask =
        new FieldMask(this.settings$.value.Prefill, this.group.controls, null, null, this.eavService.eavConfig);
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
