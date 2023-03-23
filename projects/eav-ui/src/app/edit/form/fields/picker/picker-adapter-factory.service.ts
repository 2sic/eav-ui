import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EntityInfo } from 'projects/edit-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { PickerSourceAdapter } from './picker-source-adapter';
import { PickerStateAdapter } from './picker-state-adapter';
import { PickerComponent } from './picker.component';

@Injectable()
export class PickerAdapterFactoryService {
  constructor() {
  }

  fillPickerSourceAdapter(
    pickerSourceAdapter: PickerSourceAdapter,
    group: FormGroup,
    availableEntities$: BehaviorSubject<EntityInfo[]>,
    editEntity: (entity: { entityGuid: string, entityId: number }) => void,
    deleteEntity: (entity: { index: number, entityGuid: string }) => void,
    fetchEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
  ): PickerSourceAdapter {
    pickerSourceAdapter.group = group;
    pickerSourceAdapter.availableEntities$ = availableEntities$;
    pickerSourceAdapter.editEntity = (entity: { entityGuid: string, entityId: number }) => editEntity(entity);
    pickerSourceAdapter.deleteEntity = (entity: { index: number, entityGuid: string }) => deleteEntity(entity);
    pickerSourceAdapter.fetchAvailableEntities =
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);

    return pickerSourceAdapter;
  }

  fillPickerStateAdapter(
    pickerStateAdapter: PickerStateAdapter,
    config: FieldConfigSet,
    freeTextMode$: BehaviorSubject<boolean>,
    disableAddNew$: BehaviorSubject<boolean>,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    error$: BehaviorSubject<string>,
    selectedEntities$: Observable<SelectedEntity[]>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    updateValue: (action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) => void,
    toggleFreeTextMode: () => void,
  ): PickerStateAdapter {
    pickerStateAdapter.config = config;
    pickerStateAdapter.freeTextMode$ = freeTextMode$;
    pickerStateAdapter.disableAddNew$ = disableAddNew$;
    pickerStateAdapter.controlStatus$ = controlStatus$;
    pickerStateAdapter.error$ = error$;
    pickerStateAdapter.selectedEntities$ = selectedEntities$;
    pickerStateAdapter.label$ = label$;
    pickerStateAdapter.placeholder$ = placeholder$;
    pickerStateAdapter.required$ = required$;
    pickerStateAdapter.addSelected = (guid: string) => updateValue('add', guid);
    pickerStateAdapter.removeSelected = (index: number) => updateValue('delete', index);
    pickerStateAdapter.reorder = (reorderIndexes: ReorderIndexes) => updateValue('reorder', reorderIndexes);
    pickerStateAdapter.toggleFreeTextMode = () => toggleFreeTextMode();

    return pickerStateAdapter;
  }

  // fillPickerSourceAdapter(
  //   this: PickerComponent
  // ): void {
  //   this.pickerSourceAdapter.group = this.group;
  //   this.pickerSourceAdapter.availableEntities$ = this.availableEntities$;
  //   this.pickerSourceAdapter.editEntity = (entity: { entityGuid: string, entityId: number }) => this.editEntity(entity);
  //   this.pickerSourceAdapter.deleteEntity = (entity: { index: number, entityGuid: string }) => this.deleteEntity(entity);
  //   this.pickerSourceAdapter.fetchAvailableEntities =
  //     (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache);
  // }

  // fillPickerStateAdapter(
  //   this: PickerComponent
  // ): void {
  //   this.pickerStateAdapter.config = this.config;
  //   this.pickerStateAdapter.freeTextMode$ = this.freeTextMode$;
  //   this.pickerStateAdapter.disableAddNew$ = this.disableAddNew$;
  //   this.pickerStateAdapter.controlStatus$ = this.controlStatus$;
  //   this.pickerStateAdapter.error$ = this.error$;
  //   this.pickerStateAdapter.selectedEntities$ = this.selectedEntities$;
  //   this.pickerStateAdapter.label$ = this.label$;
  //   this.pickerStateAdapter.placeholder$ = this.placeholder$;
  //   this.pickerStateAdapter.required$ = this.required$;
  //   this.pickerStateAdapter.addSelected = (guid: string) => this.updateValue('add', guid);
  //   this.pickerStateAdapter.removeSelected = (index: number) => this.updateValue('delete', index);
  //   this.pickerStateAdapter.reorder = (reorderIndexes: ReorderIndexes) => this.updateValue('reorder', reorderIndexes);
  //   this.pickerStateAdapter.toggleFreeTextMode = () => this.toggleFreeTextMode();
  // }
}
