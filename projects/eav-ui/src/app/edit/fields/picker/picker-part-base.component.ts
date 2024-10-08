import { Component, inject } from '@angular/core';
import { FieldSettingsPickerMerged } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { FieldSettingsWithPickerSource } from '../../../../../../edit-types/src/PickerSources';
import { classLog } from '../../../shared/logging';
import { computedObj } from '../../../shared/signals/signal.utilities';
import { FieldState } from '../../fields/field-state';
import { EditRoutingService } from '../../routing/edit-routing.service';

/**
 * Base class for Picker Part Components.
 */
@Component({
  selector: 'app-picker-part-base',
  template: '',
})
export class PickerPartBaseComponent {

  //#region Setup: Logging, inject, constructor

  log = classLog({PickerPartBaseComponent});

  /** Entire Field State */
  protected fieldState = inject(FieldState) as FieldState<FieldValue, FieldSettingsWithPickerSource & FieldSettingsPickerMerged>;

  /** Routing service to open edit-dialogs for entities where necessary */
  editRoutingService = inject(EditRoutingService);

  constructor() { }

  //#endregion

  //#region Settings - simple values

  protected enableTextEntry = this.fieldState.settingExt('EnableTextEntry');

  //#endregion

  /** Picker Data Bundle with Source and state etc. */
  protected pickerData = this.fieldState.pickerData;

  protected isInFreeTextMode = this.pickerData.state.isInFreeTextMode;

  protected ui = this.fieldState.ui;

  /** All Selected Items */
  protected selectedItems = this.pickerData.selectedAll;
  protected selectedItem = this.pickerData.selectedOne;
  itemCount = computedObj('itemCount', () => this.selectedItems().length);

  /** Field Configuration - from field state */
  protected config = this.fieldState.config;

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  protected basics = this.fieldState.basics;

  /** Features */
  protected features = this.pickerData.features;

  //#region CRUD style operations

  expandDialog() {
    const config = this.fieldState.config;
    if (config.initialDisabled) return;
    this.editRoutingService.expand(true, config.index, config.entityGuid);
  }

  openNewEntityDialog(entityType: string): void {
    this.log.a(`openNewEntityDialog: '${entityType}'`);
    this.pickerData.source.editItem(null, entityType);
  }

  //#endregion

  toggleFreeText(disabled: boolean): void {
    this.log.a(`toggleFreeText ${disabled}`);
    if (disabled) return;
    this.pickerData.state.toggleFreeTextMode();
  }


}
