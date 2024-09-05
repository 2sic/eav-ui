import { Injector, ProviderToken } from '@angular/core';
import { transient } from '../../../core';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { PickerData } from './picker-data';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FieldState } from '../field-state';
import { DataAdapterString } from './adapters/data-adapter-string';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { OfPickerConfig, PickerConfigs } from './constants/picker-config-model.constants';
import { DeleteEntityProps } from './models/picker.models';
import { StateAdapterString } from './adapters/state-adapter-string';
import { InputTypeCatalog, InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { StateAdapter } from './adapters/state-adapter';

const logSpecs = {
  name: 'PickerDataFactory',
  enabled: true,
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
  // ... not relevant: check if already initialized (because of dual-use)
  // ... call initAdaptersAndViewModel() in the control (eg. StringPickerComponent)
  // ... todo: optionally attach dialog-close watchers
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

  private createPickerAdapters(pickerData: PickerData, fieldState: FieldState<any>): void {
    const inputType = fieldState.config.inputTypeSpecs.inputType;
    const l = this.log.fn('createPickerAdapters', { pickerData, fieldState, inputType });

    // First get the state, since the sources will depend on it.
    const state = this.#getStateAdapter(inputType).linkLog(this.log);
    // TODO:
    // .attachCallback(this.focusOnSearchComponent);

    const dataSourceType = fieldState.settings().DataSourceType;
    const source = this.#getSourceAdapter(inputType, dataSourceType, state);

    pickerData.setup(logSpecs.name, state, source);
    l.end('ok', { state, source });
  }

  #getStateAdapter(inputType: InputTypeStrict): StateAdapterString {
    const type = partsMap[inputType]?.states?.[0];
    if (!type)
      throw new Error(`No State Adapter found for inputTypeSpecs: ${inputType}`);

    return transient(type, this.#injector) as StateAdapterString;
  }

  #getSourceAdapter(inputType: InputTypeStrict, dataSourceType: string, state: StateAdapter): DataAdapterString | DataAdapterQuery | DataAdapterEntity {

    // Get config for allowed sources / adapters for the current inputType
    const parts = partsMap[inputType];

    // The config type is either the forced type (from defaults for old pickers) or the specified type
    const dsType = parts.forcePickerConfig ?? dataSourceType;

    if (dsType === PickerConfigs.UiPickerSourceCustomList) {
      this.#throwIfSourceAdapterNotAllowed(inputType, DataAdapterString);
      return transient(DataAdapterString, this.#injector).setupString(
        (props: DeleteEntityProps) => state.doAfterDelete(props),
        false,
      );
    }
    
    if (dsType === PickerConfigs.UiPickerSourceQuery) {
      this.#throwIfSourceAdapterNotAllowed(inputType, DataAdapterQuery);
      return transient(DataAdapterQuery, this.#injector).linkLog(this.log).connectState(state, false);
    }
    
    if (dsType === PickerConfigs.UiPickerSourceEntity) {
      this.#throwIfSourceAdapterNotAllowed(inputType, DataAdapterEntity);
      return transient(DataAdapterEntity, this.#injector).linkLog(this.log).connectState(state, false);
    }

    // If we still don't know the type, add a no-configured-yet data-source
    if (!dsType)
      return transient(DataAdapterString, this.#injector).setupString(null, true);
  }

  #throwIfSourceAdapterNotAllowed(inputType: InputTypeStrict, dataSourceType: ProviderToken<unknown>): boolean {
    if (partsMap[inputType]?.sources?.includes(dataSourceType)) return false;
    throw new Error(`Specified SourceAdapter not allowed for inputTypeSpecs: ${inputType}: ${DataAdapterString}`);
  }

}

const partsMap: Record<string, PartMap> = {
  [InputTypeCatalog.StringPicker]: {
    sources: [DataAdapterString, DataAdapterQuery, DataAdapterEntity],
    states: [StateAdapterString],
  },
  [InputTypeCatalog.StringDropdown]: {
    sources: [DataAdapterString],
    states: [StateAdapterString],
    forcePickerConfig: PickerConfigs.UiPickerSourceCustomList,
  },
  [InputTypeCatalog.StringDropdownQuery]: {
    sources: [DataAdapterQuery],
    states: [StateAdapterString],
    forcePickerConfig: PickerConfigs.UiPickerSourceQuery,
  },
};

interface PartMap {
  sources: ProviderToken<unknown>[],
  states: ProviderToken<unknown>[],
  /** Force some string-sources to assume no-configuration, since the config is in the classic metadata, not in a DataSource config */
  forcePickerConfig?: OfPickerConfig,
}
