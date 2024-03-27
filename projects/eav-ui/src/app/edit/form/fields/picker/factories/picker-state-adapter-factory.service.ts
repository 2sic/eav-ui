import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../../shared/models';
import { EditRoutingService } from '../../../../shared/services';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { AbstractControl } from '@angular/forms';
import { PickerStringStateAdapter } from '../adapters/picker-string-state-adapter';
import { PickerEntityStateAdapter } from '../adapters/picker-entity-state-adapter';
import { PickerComponent } from '../picker.component';

@Injectable()
export class PickerStateAdapterFactoryService {
  constructor(private injector: Injector) { }

  // createPickerEntityStateAdapter(component: PickerComponent): PickerEntityStateAdapter{
  //   return this.injector.get(PickerEntityStateAdapter).setupFromComponent(component);
  // }

  createPickerStringStateAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    focusOnSearchComponent: () => void,
  ): PickerStringStateAdapter {
    const pickerStringStateAdapter = this.injector.get(PickerStringStateAdapter)
    .setupShared(
      settings$,
      config,
      controlStatus$,
      editRoutingService.isExpanded$(config.index, config.entityGuid),
      label$,
      placeholder$,
      required$,
      control,
      focusOnSearchComponent,
    );

    return pickerStringStateAdapter;
  }

  initString(pickerStringStateAdapter: PickerStringStateAdapter): void {
    pickerStringStateAdapter.init();
  }

  createPickerStateAdapter(
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    editRoutingService: EditRoutingService,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    focusOnSearchComponent: () => void,
  ): PickerStateAdapter {
    const pickerStateAdapter = this.injector.get(PickerStateAdapter)
    .setupShared(
      settings$,
      config,
      controlStatus$,
      editRoutingService.isExpanded$(config.index, config.entityGuid),
      label$,
      placeholder$,
      required$,
      control,
      focusOnSearchComponent,
    );

    return pickerStateAdapter;
  }

  init(pickerStateAdapter: PickerStateAdapter): void {
    pickerStateAdapter.init();
  }
}
