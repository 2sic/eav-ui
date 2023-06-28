import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EditRoutingService, FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { EntityPickerPreviewTemplateVars } from './picker-preview.models';
import { FieldConfigSet, FieldControlConfig } from '../../../builder/fields-builder/field-config-set.model';
import { Field } from '../../../builder/fields-builder/field.model';
import { BaseSubsinkComponent } from 'projects/eav-ui/src/app/shared/components/base-subsink-component/base-subsink.component';

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
})
export class PickerPreviewComponent extends BaseSubsinkComponent implements OnInit, OnDestroy, Field {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() controlConfig: FieldControlConfig;

  templateVars$: Observable<EntityPickerPreviewTemplateVars>;
  private control: AbstractControl;

  private filter$ = new BehaviorSubject(false);

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
    this.templateVars$ = combineLatest([
      debugEnabled$, settings$, selectedEntities$, availableEntities$, error$, controlStatus$, freeTextMode$,
      disableAddNew$, label$, placeholder$, required$, tooltip$, information$, isDialog$, this.filter$
    ]).pipe(
      map(([
        debugEnabled, settings, selectedEntities, availableEntities, error, controlStatus, freeTextMode,
        disableAddNew, label, placeholder, required, tooltip, information, isDialog, filter
      ]) => {
        const div = document.createElement("div");
        div.innerHTML = tooltip;
        const cleanTooltip = div.innerText || '';
        div.innerHTML = information;
        const cleanInformation = div.innerText || '';

        const selectedEntity = selectedEntities.length > 0 ? selectedEntities[0] : null;
        let filteredEntities: EntityInfo[] = [];
        const elemValue = this.autocompleteRef?.nativeElement.value;
        filteredEntities = !elemValue ? availableEntities : availableEntities?.filter(option =>
          option.Text
            ? option.Text.toLocaleLowerCase().includes(elemValue.toLocaleLowerCase())
            : option.Value.toLocaleLowerCase().includes(elemValue.toLocaleLowerCase())
        );

        const allowItemEditButtons = !settings.AllowMultiValue || (settings.AllowMultiValue && this.controlConfig.isPreview);
        const showAddNewEntityButtonInPreview = settings.EnableCreate && settings.EntityType && !(selectedEntities.length > 1);
        const showGoToListDialogButton = settings.AllowMultiValue && this.controlConfig.isPreview;
        const showAddNewEntityButtonInDialog = !freeTextMode && settings.EnableCreate && settings.EntityType && settings.AllowMultiValue && !this.controlConfig.isPreview;
        const showEmpty = !settings.EnableAddExisting && !(selectedEntities.length > 1);
        const hideDropdown = (!settings.AllowMultiValue && (selectedEntities.length > 1)) || !settings.EnableAddExisting;
        const leavePlaceForButtons = settings.EnableCreate && settings.EntityType && !(selectedEntities.length > 1) && !settings.AllowMultiValue;
        const showEmptyInputInDialog = settings.AllowMultiValue && !this.controlConfig.isPreview;

        const templateVars: EntityPickerPreviewTemplateVars = {
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
          selectedEntity,
          filteredEntities,

          // additional properties for easier readability in the template
          allowItemEditButtons,
          showAddNewEntityButtonInPreview,
          showGoToListDialogButton,
          showAddNewEntityButtonInDialog,
          showEmpty,
          hideDropdown,
          leavePlaceForButtons,
          showEmptyInputInDialog,
        };

        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  markAsTouched(selectedEntity: SelectedEntity, selectedEntities: SelectedEntity[], showEmptyInputInDialog: boolean): void {
    if (selectedEntity && selectedEntities.length < 2 && !showEmptyInputInDialog)
      this.autocompleteRef.nativeElement.value = selectedEntity.label;
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

  filterSelectionList(): void { 
    // const filter = this.autocompleteRef?.nativeElement.value;
    this.filter$.next(/*filter*/true);
  }

  optionSelected(event: MatAutocompleteSelectedEvent, allowMultiValue: boolean, selectedEntity: SelectedEntity): void {
    if (!allowMultiValue && selectedEntity) this.removeItem(0);
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
}
