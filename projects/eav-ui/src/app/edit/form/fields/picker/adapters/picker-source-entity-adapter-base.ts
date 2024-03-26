import { HttpErrorResponse } from "@angular/common/http";
import { EditForm } from "projects/eav-ui/src/app/shared/models/edit-form.model";
import { DeleteEntityProps } from "../picker.models";
import { PickerSourceAdapterBase } from "./picker-source-adapter-base";
import { FieldMask, GeneralHelpers } from "../../../../shared/helpers";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings } from "projects/edit-types";
import { EntityService, EavService, EditRoutingService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

export abstract class PickerSourceEntityAdapterBase extends PickerSourceAdapterBase {
  private createEntityTypes: string = '';
  protected contentTypeMask: FieldMask;
  protected contentType: string;
  protected deletedItemGuids$ = new BehaviorSubject<string[]>([]);

  constructor(
    public entityCacheService: EntityCacheService,  // DI
    public entityService: EntityService, // DI
    public eavService: EavService, // DI
    public editRoutingService: EditRoutingService, // DI
    protected translate: TranslateService, // DI
    public snackBar: MatSnackBar,
    logSpecs: EavLogger,
  ) {
    super(logSpecs);
  }

  disableAddNew$: BehaviorSubject<boolean>;
  settings$: BehaviorSubject<FieldSettings>;
  protected config: FieldConfigSet;
  protected group: FormGroup;
  public control: AbstractControl;

  public setupShared(
    settings$: BehaviorSubject<FieldSettings>,
    config: FieldConfigSet,
    group: FormGroup,
    control: AbstractControl,
    disableAddNew$: BehaviorSubject<boolean>,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): this {
    this.log.add('setupShared');
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
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(settings => {
        this.createEntityTypes = settings.CreateEntityTypes;
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMask(
          settings.EntityType,
          this.group.controls,
          () => {
            this.availableItems$.next(null);
            this.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
          this.config,
        );
        this.availableItems$.next(null);
        this.updateAddNew();
      })
    );
  }

  destroy(): void {
    this.settings$.complete();

    super.destroy();
  }

  onAfterViewInit(): void {
    this.contentType = this.contentTypeMask.resolve();
  }

  updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName && !this.createEntityTypes);
  }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void {
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
      const entity = this.availableItems$.value.find(item => item.Value === editParams.entityGuid);
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

  deleteItem(props: DeleteEntityProps): void {
    const entity = this.availableItems$.value.find(item => item.Value === props.entityGuid);
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