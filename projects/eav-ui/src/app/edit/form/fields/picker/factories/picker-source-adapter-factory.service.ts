import { Injectable, Injector } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { DeleteEntityProps } from '../picker.models';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { PickerQuerySourceAdapter } from '../adapters/picker-query-source-adapter';
import { PickerEntitySourceAdapter } from '../adapters/picker-entity-source-adapter';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class PickerSourceAdapterFactoryService extends ServiceBase {
  constructor(private injector: Injector) {
    super(new EavLogger('PickerSourceAdapterFactoryService', logThis));
  }

  createPickerQuerySourceAdapter(
    error$: BehaviorSubject<string>,
    disableAddNew$: BehaviorSubject<boolean>,
    isStringQuery: boolean,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerQuerySourceAdapter {
    this.log.add('createPickerQuerySourceAdapter');
    const pickerQuerySourceAdapter = this.injector.get(PickerQuerySourceAdapter);
    pickerQuerySourceAdapter.setupShared(
      settings$,
      config,
      group,
      control,
      disableAddNew$,
      deleteCallback,
    ).setupQuery(
      error$,
      isStringQuery,
    );
    return pickerQuerySourceAdapter;
  }

  createPickerEntitySourceAdapter(
    disableAddNew$: BehaviorSubject<boolean>,
    control: AbstractControl,
    config: FieldConfigSet,
    settings$: BehaviorSubject<FieldSettings>,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
  ): PickerEntitySourceAdapter {
    this.log.add('createPickerEntitySourceAdapter');
    const pickerEntitySourceAdapter = this.injector.get(PickerEntitySourceAdapter);
    this.log.add('createPickerEntitySourceAdapter', 'got pickerEntitySourceAdapter');

    pickerEntitySourceAdapter.setupShared(
      settings$,
      config,
      group,
      control,
      disableAddNew$,
      deleteCallback,
    )

    return pickerEntitySourceAdapter;
  }

  // createPickerStringSourceAdapter(
  //   disableAddNew$: BehaviorSubject<boolean>,
  //   config: FieldConfigSet,
  //   settings$: BehaviorSubject<FieldSettings>,
  //   group: FormGroup,
  //   deleteCallback: (props: DeleteEntityProps) => void,
  // ): PickerStringSourceAdapter {
  //   this.log.add('createPickerStringSourceAdapter');
  //   const pickerStringSourceAdapter = this.injector.get(PickerStringSourceAdapter);
  //   pickerStringSourceAdapter.setupString(settings$, disableAddNew$, config, group, deleteCallback);

  //   return pickerStringSourceAdapter;
  // }

}
