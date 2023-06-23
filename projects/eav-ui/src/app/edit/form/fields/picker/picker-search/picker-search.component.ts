import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from 'projects/edit-types';
import { combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { PickerSearchViewModel } from './picker-search.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';

@Component({
  selector: 'app-picker-search',
  templateUrl: './picker-search.component.html',
  styleUrls: ['./picker-search.component.scss'],
})
export class PickerSearchComponent extends BaseSubsinkComponent implements OnInit, OnChanges, OnDestroy, Field {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  // @2SDV TODO make this selectedEntity, selectedEntities an observable
  selectedEntity: SelectedEntity | null = null;
  selectedEntities: SelectedEntity[] = [];

  // @2SDV TODO make this filteredEntities an observable
  filteredEntities: EntityInfo[] = [];
  viewModel$: Observable<PickerSearchViewModel>;
  private control: AbstractControl;
  private availableEntities: EntityInfo[] = [];

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
  ) {
    super();
   }

  ngOnInit(): void {
    this.control = this.group.controls[this.config.fieldName];

    const availableEntities$ = this.pickerSourceAdapter.availableEntities$;

    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const disableAddNew$ = this.pickerStateAdapter.disableAddNew$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const error$ = this.pickerStateAdapter.error$;
    const selectedEntities$ = this.pickerStateAdapter.selectedEntities$;
    const label$ = this.pickerStateAdapter.label$;
    const placeholder$ = this.pickerStateAdapter.placeholder$;
    const required$ = this.pickerStateAdapter.required$;
    const tooltip$ = this.pickerStateAdapter.tooltip$;
    const information$ = this.pickerStateAdapter.information$;
    const isDialog$ = this.pickerStateAdapter.isDialog$;

    this.subscription.add(availableEntities$.subscribe(entities => {
      this.availableEntities = entities;
    }));
    this.subscription.add(selectedEntities$.subscribe(entities => {
      this.selectedEntities = entities;
      this.selectedEntity = this.selectedEntities.length > 0 ? this.selectedEntities[0] : null;
      this.fillValue();
    }));

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
        EnableAddExisting: settings.EnableAddExisting,
        EnableTextEntry: settings.EnableTextEntry,
        EnableEdit: settings.EnableEdit,
        EnableDelete: settings.EnableDelete,
        EnableRemove: settings.EnableRemove,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.viewModel$ = combineLatest([
      debugEnabled$, settings$, selectedEntities$, availableEntities$, error$, controlStatus$,
      freeTextMode$, disableAddNew$, label$, placeholder$, required$, tooltip$, information$, isDialog$
    ]).pipe(
      map(([
        debugEnabled, settings, selectedEntities, availableEntities, error, controlStatus,
        freeTextMode, disableAddNew, label, placeholder, required, tooltip, information, isDialog
      ]) => {
        const div = document.createElement("div");
        div.innerHTML = tooltip;
        const cleanTooltip = div.innerText || '';
        div.innerHTML = information;
        const cleanInformation = div.innerText || '';

        const allowItemEditButtons = !settings.AllowMultiValue || (settings.AllowMultiValue && this.controlConfig.isPreview);
        const showAddNewEntityButtonInPreview = settings.EnableCreate && settings.EntityType && !(selectedEntities.length > 1);
        const showGoToListDialogButton = settings.AllowMultiValue && this.controlConfig.isPreview;
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.EntityType && settings.AllowMultiValue && !this.controlConfig.isPreview;
        const showEmpty = !settings.EnableAddExisting && !(selectedEntities.length > 1);
        const hideDropdown = (!settings.AllowMultiValue && (selectedEntities.length > 1)) || !settings.EnableAddExisting;
        const leavePlaceForButtons = settings.EnableCreate && settings.EntityType && !(selectedEntities.length > 1) && !settings.AllowMultiValue;

        const viewModel: PickerSearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.AllowMultiValue,
          enableCreate: settings.EnableCreate,
          entityType: settings.EntityType,
          enableAddExisting: settings.EnableAddExisting,
          enableTextEntry: settings.EnableTextEntry,
          enableEdit: settings.EnableEdit,
          enableDelete: settings.EnableDelete,
          enableRemove: settings.EnableRemove,
          selectedEntities,
          availableEntities,
          error,
          controlStatus,
          freeTextMode,
          disableAddNew,
          label,
          placeholder,
          required,
          tooltip: cleanTooltip,
          information: cleanInformation,
          isDialog,

          // additional properties for easier readability in the template
          allowItemEditButtons,
          showAddNewEntityButtonInPreview,
          showGoToListDialogButton,
          showAddNewEntityButtonInDialog,
          showEmpty,
          hideDropdown,
          leavePlaceForButtons
        };
        return viewModel;
      }),
    );
  }

  ngAfterViewInit(): void { 
    this.fillValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableEntities != null) {
      this.filterSelectionList(this.availableEntities);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  markAsTouched(): void {
    if (this.selectedEntity && this.selectedEntities.length < 2) 
      this.autocompleteRef.nativeElement.value = this.selectedEntity.label;
    GeneralHelpers.markControlTouched(this.control);
  }

  fetchEntities(availableEntities: EntityInfo[]): void {
    this.autocompleteRef.nativeElement.value = '';
    if (availableEntities != null) { return; }
    this.pickerSourceAdapter.fetchEntities(false);
  }

  getPlaceholder(availableEntities: EntityInfo[], error: string): string {
    if (availableEntities == null) {
      return this.translate.instant('Fields.Entity.Loading');
    }
    if (availableEntities.length > 0) {
      return this.translate.instant('Fields.Entity.Search');
    }
    if (error) {
      return error;
    }
    return this.translate.instant('Fields.EntityQuery.QueryNoItems');
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerStateAdapter.toggleFreeTextMode();
  }

  filterSelectionList(availableEntities: EntityInfo[]): EntityInfo[] {
    if (availableEntities == null) { return []; }

    const filter = this.autocompleteRef?.nativeElement.value;
    if (!filter) {
      this.filteredEntities = availableEntities;
      return;
    }


    this.filteredEntities = availableEntities.filter(option =>
      option.Text
        ? option.Text.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        : option.Value.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    );
  }

  optionSelected(event: MatAutocompleteSelectedEvent, allowMultiValue: boolean): void {
    if (!allowMultiValue && this.selectedEntity) this.removeItem(0);
    const selected: string = event.option.value;
    this.pickerStateAdapter.addSelected(selected);
    // TODO: @SDV - This is needed so after choosing option element is not focused (it gets focused by default so if blur is outside of setTimeout it will happen before refocus)
    setTimeout(() => {
      this.autocompleteRef.nativeElement.blur();
    });
  }

  insertNull(): void {
    this.pickerStateAdapter.addSelected(null);
  }

  isOptionDisabled(value: string, selectedEntities: SelectedEntity[]): boolean {
    const isSelected = selectedEntities.some(entity => entity.value === value);
    return isSelected;
  }

  openNewEntityDialog(): void {
    this.pickerSourceAdapter.editEntity(null);
  }

  edit(entityGuid: string, entityId: number): void {
    this.pickerSourceAdapter.editEntity({ entityGuid, entityId });
  }

  removeItem(index: number): void {
    this.pickerStateAdapter.removeSelected(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.pickerSourceAdapter.deleteEntity({ index, entityGuid });
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }

  private fillValue(): void {
    if (this.autocompleteRef)
      if (this.selectedEntity && this.selectedEntities.length < 2) {
        this.autocompleteRef.nativeElement.value = this.selectedEntity.label;
      } else {
        this.autocompleteRef.nativeElement.value = '';
      }
  }
}
