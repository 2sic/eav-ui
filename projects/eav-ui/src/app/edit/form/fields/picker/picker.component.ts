import { moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { EditForm } from 'projects/eav-ui/src/app/shared/models/edit-form.model';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { FieldMask, GeneralHelpers } from '../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../base/base-field.component';
import { calculateSelectedEntities, convertArrayToString, convertValueToArray } from '../entity/entity-default/entity-default.helpers';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { PickerSearchComponent } from './picker-search/picker-search.component';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';
import { DeleteEntityProps, EntityViewModel } from './picker.models';

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: './picker.component.html',
  styleUrls: ['./picker.component.scss'],
})
@FieldMetadata({})
export class PickerComponent extends BaseFieldComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(PickerSearchComponent) private entitySearchComponent: PickerSearchComponent;

  pickerSourceAdapter: PickerSourceAdapter = new PickerSourceAdapter();
  pickerStateAdapter: PickerStateAdapter = new PickerStateAdapter();

  isQuery: boolean;
  isStringQuery: boolean;
  contentTypeMask?: FieldMask;

  error$: BehaviorSubject<string>;
  freeTextMode$: BehaviorSubject<boolean>;
  disableAddNew$: BehaviorSubject<boolean>;
  isExpanded$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  availableEntities$: BehaviorSubject<EntityInfo[]>;
  viewModel$: Observable<EntityViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    protected entityService: EntityService,
    public translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private snackBar: MatSnackBar,
    public entityCacheService: EntityCacheService,
    public stringQueryCacheService: StringQueryCacheService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.error$ = new BehaviorSubject('');
    this.freeTextMode$ = new BehaviorSubject(false);
    this.disableAddNew$ = new BehaviorSubject(true);
    this.availableEntities$ = new BehaviorSubject<EntityInfo[]>(null);

    this.selectedEntities$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(this.config.entityGuid, this.config.fieldName),
      this.settings$.pipe(
        map(settings => ({
          Separator: settings.Separator,
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      map(([value, entityCache, stringQueryCache, settings]) =>
        calculateSelectedEntities(value, settings.Separator, entityCache, stringQueryCache, settings.Value, settings.Label, this.translate)
      ),
    );

    this.isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    const allowMultiValue$ = this.settings$.pipe(map(settings => settings.AllowMultiValue), distinctUntilChanged());
    this.viewModel$ =
      combineLatest([this.freeTextMode$, allowMultiValue$, this.selectedEntities$, this.availableEntities$, this.isExpanded$])
    .pipe(
      map((
        [freeTextMode, allowMultiValue, selectedEntities, availableEntities, isExpanded]
      ) => {
        const viewModel: EntityViewModel = {
          freeTextMode,
          allowMultiValue,
          selectedEntities,
          availableEntities,
          isExpanded,
        };
        return viewModel;
      }),
    );

    this.pickerSourceAdapter.group = this.group;
    this.pickerSourceAdapter.availableEntities$ = this.availableEntities$;
    this.pickerSourceAdapter.editEntity = (entity: { entityGuid: string, entityId: number }) => this.editEntity(entity);
    this.pickerSourceAdapter.deleteEntity = (entity: { index: number, entityGuid: string }) => this.deleteEntity(entity);
    this.pickerSourceAdapter.fetchAvailableEntities =
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);

    this.pickerStateAdapter.config = this.config;
    this.pickerStateAdapter.freeTextMode$ = this.freeTextMode$;
    this.pickerStateAdapter.disableAddNew$ = this.disableAddNew$;
    this.pickerStateAdapter.controlStatus$ = this.controlStatus$;
    this.pickerStateAdapter.error$ = this.error$;
    this.pickerStateAdapter.selectedEntities$ = this.selectedEntities$;
    this.pickerStateAdapter.label$ = this.label$;
    this.pickerStateAdapter.placeholder$ = this.placeholder$;
    this.pickerStateAdapter.required$ = this.required$;
    this.pickerStateAdapter.addSelected = (guid: string) => this.updateValue('add', guid);
    this.pickerStateAdapter.removeSelected = (index: number) => this.updateValue('delete', index);
    this.pickerStateAdapter.reorder = (reorderIndexes: ReorderIndexes) => this.updateValue('reorder', reorderIndexes);
    this.pickerStateAdapter.toggleFreeTextMode = () => this.toggleFreeTextMode();

    this.refreshOnChildClosed();
  }

  ngAfterViewInit(): void {
    this.fixPrefillAndStringQueryCache();
  }

  ngOnDestroy(): void {
    this.error$.complete();
    this.freeTextMode$.complete();
    this.disableAddNew$.complete();
    this.availableEntities$.complete();
    this.contentTypeMask?.destroy();
    super.ngOnDestroy();
  }

  toggleFreeTextMode(): void {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }

  /**
   * WARNING! Overridden in subclass.
   * @param clearAvailableEntitiesAndOnlyUpdateCache - clears availableEntities and fetches only items which are selected
   * to update names in entityCache
   */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void { }

  // Note: 2dm 2023-01-24 added entityId as parameter #maybeRemoveGuidOnEditEntity
  // not even sure if the guid would still be needed, as I assume the entityId
  // should always be available.
  // Must test all use cases and then probably simplify again.
  editEntity(editParams: { entityGuid: string, entityId: number }): void {
    let form: EditForm;
    if (editParams?.entityGuid == null) {
      const contentTypeName = this.contentTypeMask.resolve();
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
      const prefillMask = new FieldMask(this.settings$.value.Prefill, this.group.controls, null, null, this.eavService.eavConfig);
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

  deleteEntity(props: DeleteEntityProps): void {
    const entity = this.entityCacheService.getEntity(props.entityGuid);
    const id = entity.Id;
    const title = entity.Text;
    const contentType = this.contentTypeMask.resolve();
    const parentId = this.config.entityId;
    const parentField = this.config.fieldName;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open(this.translate.instant('Message.Deleting'));
    this.entityService.delete(contentType, id, false, parentId, parentField).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.updateValue('delete', props.index);
        this.fetchEntities(true);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true, parentId, parentField).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.updateValue('delete', props.index);
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
  private fixPrefillAndStringQueryCache(): void {
    // filter out null items
    const guids = convertValueToArray(this.control.value, this.settings$.value.Separator).filter(guid => !!guid);
    if (guids.length === 0) { return; }

    const cached = this.entityCacheService.getEntities(guids);
    if (guids.length !== cached.length) {
      this.fetchEntities(true);
    }
  }

  private refreshOnChildClosed(): void {
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.updateValue('add', newItemGuid);
      })
    );
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchEntities(true);
      })
    );
  }

  private updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    const valueArray: string[] = (typeof this.control.value === 'string')
      ? convertValueToArray(this.control.value, this.settings$.value.Separator)
      : [...this.control.value];

    switch (action) {
      case 'add':
        const guid = value as string;
        valueArray.push(guid);
        break;
      case 'delete':
        const index = value as number;
        valueArray.splice(index, 1);
        break;
      case 'reorder':
        const reorderIndexes = value as ReorderIndexes;
        moveItemInArray(valueArray, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
        break;
    }

    const newValue = typeof this.control.value === 'string'
      ? convertArrayToString(valueArray, this.settings$.value.Separator)
      : valueArray;
    GeneralHelpers.patchControlValue(this.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      setTimeout(() => {
        this.entitySearchComponent.autocompleteRef?.nativeElement.focus();
      });
    }
  }

}
