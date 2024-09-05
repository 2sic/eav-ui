import { Injector } from '@angular/core';
import { transient } from '../../../core';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { PickerData } from './picker-data';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FieldState } from '../field-state';
import { DataAdapterString } from './adapters/data-adapter-string';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { PickerConfigModels } from './constants/picker-config-model.constants';
import { DeleteEntityProps } from './models/picker.models';
import { StateAdapterString } from './adapters/state-adapter-string';

const logSpecs = {
  name: 'PickerDataFactory',
  enabled: false,
};

/**
 * Factory for creating PickerData instances.
 * Goal is to move all the logic for which combination of input types
 * result in what states etc. to here.
 * 
 * WIP
 */
export class PickerDataFactory {

  log = new EavLogger(logSpecs);

  constructor(injector: Injector) {
    this.#injector = injector;
  }

  #injector: Injector;

  // Notes: previous flow of initialization
  // 1. Final control (eg. StringPickerComponent) gets services which it will use using transient(...)
  // ... and also importMe on the logic
  // 2. PickerComponent.ngOnInit() will
  // ... check if already initialized (because of dual-use)
  // ... call initAdaptersAndViewModel() in the control (eg. StringPickerComponent)
  // ... optionally attach dialog-close watchers
  // 3. The control will override initAdaptersAndViewModel()
  // 3.1 init state with
  // ... log
  // ... it will also attach a CALLBACK! for focused?
  // 3.2 to chose which sources are possible
  // ... create the correct one
  // ... connect logs
  // ... connect state
  // 3.3 pickerData.setup(nameOfThis, state, source);
  // 4. PickerData.setup(name: string, state: StateAdapter, source: DataAdapterBase) does it's magic
  // 5. The PickerComponent.ngAfterViewInit will trigger the source.onAfterViewInit to setup query/template parameters (using a mask)


  // Plan
  // 1. Create factory setup method here for String
  // 2. Trigger that instead of the current setupString in StringPickerComponent
  // 3. once it works start moving the other setups here


  createPickerData(inputType: InputTypeSpecs): PickerData {
    return (InputTypeHelpers.isAnyPicker(inputType.inputType))
      ? transient(PickerData, this.#injector)
      : null;
  }

  setupPickerData(pickerData: PickerData, fieldState: FieldState<any>): PickerData {
    // Steps from the StringPickerComponent.initAdaptersAndViewModel
    this.createPickerAdapters(pickerData, fieldState);
    pickerData.source.onAfterViewInit()
    return pickerData;
  }

  // /**
  //  * Initialize the Picker Adapter and View Model
  //  * If the PickerData already exists, it will be reused
  //  */
  // private initAdaptersAndViewModel(): void {
  //   this.log.a('initAdaptersAndViewModel');
  //   // const config = this.fieldState.config;
  //   // First, create the Picker Adapter or reuse
  //   // The reuse is a bit messy - reason is that there are two components (preview/dialog)
  //   // which have the same services, and if one is created first, the pickerData should be shared
  //   // if (!this.mustInitializePicker) {
  //   //   this.log.a('createPickerAdapters: pickerData already exists, will reuse');
  //   // } else {
  //     // this method is overridden in each variant as of now
  //     this.createPickerAdapters();
  //     this.log.a('createPickerAdapters: config', /* { config } */);
  //   // }
  // }

  private createPickerAdapters(pickerData: PickerData, fieldState: FieldState<any>): void {
    this.log.a('createPickerAdapters');

    let source: DataAdapterString | DataAdapterQuery | DataAdapterEntity;

    const state = this.getBestStateAdapter(null).linkLog(this.log);
    // TODO:
    // .attachCallback(this.focusOnSearchComponent);

    const dataSourceType = fieldState.settings().DataSourceType;
    const isEmpty = !dataSourceType;

    if (dataSourceType === PickerConfigModels.UiPickerSourceCustomList || isEmpty) {
      source = transient(DataAdapterString, this.#injector).setupString(
        (props: DeleteEntityProps) => state.doAfterDelete(props),
        isEmpty,
      );
    }
    else if (dataSourceType === PickerConfigModels.UiPickerSourceQuery)
      source = transient(DataAdapterQuery, this.#injector).linkLog(this.log).connectState(state, false);
    else if (dataSourceType === PickerConfigModels.UiPickerSourceEntity)
      source = transient(DataAdapterEntity, this.#injector).linkLog(this.log).connectState(state, false);


    pickerData.setup(logSpecs.name, state, source);
  }

  private getBestStateAdapter(inputTypeSpecs: InputTypeSpecs): StateAdapterString {
    return transient(StateAdapterString, this.#injector);
  }

}