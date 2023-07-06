import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core/public_api';
import { EditForm } from 'projects/eav-ui/src/app/shared/models/edit-form.model';
import { EntityInfo, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FieldMask } from '../../../shared/helpers';
import { EavService, EditRoutingService, EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { convertValueToArray } from './picker.helpers';
import { DeleteEntityProps } from './picker.models';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { QueryEntity } from '../entity/entity-query/entity-query.models';

export class PickerSourceAdapter {
  constructor(
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),

    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,

    protected config: FieldConfigSet,
    protected group: FormGroup,

    public snackBar: MatSnackBar,
    public control: AbstractControl,

    // public fetchAvailableEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) { }

  availableEntities$: BehaviorSubject<EntityInfo[]> = new BehaviorSubject<EntityInfo[]>(null);

  contentType: string;

  protected subscription = new Subscription();

  init() { }

  onAfterViewInit(): void {
    this.fixPrefillAndStringQueryCache();
  }

  destroy() {
    this.settings$.complete();
    this.availableEntities$.complete();
    this.settings$.complete();
    this.subscription.unsubscribe();
  }

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
        this.deleteCallback(props);
        this.fetchEntities(true);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.deleteCallback(props);
            this.fetchEntities(true);
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
      this.fetchEntities(true);
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

  /** fill additional properties that are marked in settings.MoreFields and replace tooltip and information placeholders */
  protected fillEntityInfoMoreFields(entity: QueryEntity, entityInfo: EntityInfo): EntityInfo { 
    const settings = this.settings$.value;
    const additionalFields = settings.MoreFields?.split(',') || [];
    let tooltip = this.cleanStringFromWysiwyg(settings.Tooltip);
    let information = this.cleanStringFromWysiwyg(settings.Information);
    additionalFields.forEach(field => {
      entityInfo[field] = entity[field];
      tooltip = tooltip.replace(`[Item:${field}]`, entity[field]);
      information = information.replace(`[Item:${field}]`, entity[field]);
    });
    entityInfo.Tooltip = tooltip;
    entityInfo.Information = information;
    return entityInfo;
  }

  /** remove HTML tags that come from WYSIWYG */
  private cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }

  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void { }
}
