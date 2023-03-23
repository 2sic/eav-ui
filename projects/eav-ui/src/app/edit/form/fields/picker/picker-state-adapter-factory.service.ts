import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { ReorderIndexes } from './picker-list/picker-list.models';
import { PickerStateAdapter } from './picker-state-adapter';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor() { }

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
}
