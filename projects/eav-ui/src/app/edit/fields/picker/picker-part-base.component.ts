import { Component, inject } from '@angular/core';
import { FieldState } from '../../fields/field-state';
import { classLog } from '../../../shared/logging';
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
  protected fieldState = inject(FieldState);

  /** Routing service to open edit-dialogs for entities where necessary */
  editRoutingService = inject(EditRoutingService);

  constructor() { }

  //#endregion

  //#region Settings - simple values

  protected enableTextEntry = this.fieldState.setting('EnableTextEntry');

  protected allowMultiValue = this.fieldState.setting('AllowMultiValue');

  //#endregion

  
  /** Picker Data Bundle with Source and state etc. */
  protected pickerData = this.fieldState.pickerData;

  protected isInFreeTextMode = this.pickerData.state.isInFreeTextMode;

  protected ui = this.fieldState.ui;

  /** All Selected Items */
  protected selectedItems = this.pickerData.selectedAll;
  protected selectedItem = this.pickerData.selectedOne;

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

  edit(entityGuid: string, entityId: number): void {
    this.log.a(`edit guid: '${entityGuid}'; id: '${entityId}'`);
    this.pickerData.source.editItem({ entityGuid, entityId }, null);
  }

  removeItem(index: number): void {
    this.log.a(`removeItem index: '${index}'`);
    this.pickerData.state.remove(index);
  }

  deleteItem(index: number, entityGuid: string): void {
    this.log.a(`deleteItem index: '${index}'; entityGuid: '${entityGuid}'`);
    this.pickerData.source.deleteItem({ index, entityGuid });
  }


  //#endregion

  toggleFreeText(disabled: boolean): void {
    this.log.a(`toggleFreeText ${disabled}`);
    if (disabled) return;
    this.pickerData.state.toggleFreeTextMode();
  }


}
