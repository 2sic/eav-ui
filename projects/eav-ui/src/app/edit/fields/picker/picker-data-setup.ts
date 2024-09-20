import { Injector, ProviderToken } from '@angular/core';
import { transient } from '../../../core';
import { PickerData } from './picker-data';
import { FieldState } from '../field-state';
import { DataAdapterString } from './adapters/data-adapter-string';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { OfPickerConfig, PickerConfigs } from './constants/picker-config-model.constants';
import { StateAdapterString } from './adapters/state-adapter-string';
import { InputTypeCatalog, InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { StateAdapter } from './adapters/state-adapter';
import { StateAdapterEntity } from './adapters/state-adapter-entity';
import { classLog } from '../../../shared/logging';
import { DataAdapterEmpty } from './adapters/data-adapter-empty';
import { DataAdapterBase } from './adapters/data-adapter-base';

/**
 * Factory for creating PickerData instances.
 * Goal is to move all the logic for which combination of input types
 * result in what states etc. to here.
 */
export class PickerDataSetup {

  log = classLog({PickerDataSetup}, null);

  constructor(injector: Injector) {
    this.#injector = injector;
  }

  #injector: Injector;

  // Notes: previous flow of initialization
  // 1. Final control (eg. StringPickerComponent) gets services which it will use using transient(...)
  // ... and also importMe on the logic
  // 2. PickerComponent.ngOnInit() will
  // ... 
  // 3. The control will override initAdaptersAndViewModel()
  // 3.1 init state with
  // ... it will also attach a CALLBACK! for focused?

  /**
   * Setup / initialize a Picker Data.
   * Note that it can't be called when fields are being created, but must be called from inside each field.
   * Reason is that objects created later on through DI will need the FieldState and other context objects to be injected.
   */
  setupPickerData(pickerData: PickerData, fieldState: FieldState<any>): PickerData {
    const inputType = fieldState.config.inputTypeSpecs.inputType;
    const l = this.log.fn('createPickerAdapters', { pickerData, fieldState, inputType });

    // First get the state, since the sources will depend on it.
    const state = this.#getStateAdapter(inputType);

    const dataSourceType = fieldState.settings().DataSourceType;
    const source = this.#getSourceAdapter(inputType, dataSourceType, state);

    pickerData.setup(this.log.name, state, source);
    
    // l.end('ok', { state, source });

    pickerData.source.onAfterViewInit()
    return l.rSilent(pickerData);
  }

  #getStateAdapter(inputType: InputTypeStrict): StateAdapterString {
    const type = partsMap[inputType]?.states?.[0];
    if (!type)
      throw new Error(`No State Adapter found for inputTypeSpecs: ${inputType}`);

    return transient(type, this.#injector) as StateAdapterString;
  }

  #getSourceAdapter(inputType: InputTypeStrict, dataSourceType: string, state: StateAdapter): DataAdapterBase {
    const l = this.log.fn('getSourceAdapter', { inputType, dataSourceType });
    // Get config for allowed sources / adapters for the current inputType
    const parts = partsMap[inputType];

    // The config type is either the forced type (from defaults for old pickers) or the specified type
    const dsType = parts.forcePickerConfig ?? dataSourceType;

    const dataAdapterType = mapNameToDataAdapter[dsType] ?? DataAdapterEmpty;
    this.#throwIfSourceAdapterNotAllowed(inputType, dataAdapterType);
    const result = transient(dataAdapterType, this.#injector).linkLog(this.log).connectState(state);
    return l.r(result);
  }

  #throwIfSourceAdapterNotAllowed(inputType: InputTypeStrict, dataSourceType: ProviderToken<unknown>): boolean {
    // Empty is always allowed, as it's usually for errors / missing configs
    if (dataSourceType === DataAdapterEmpty) return false;
    if (partsMap[inputType]?.sources?.includes(dataSourceType)) return false;
    throw new Error(`Specified SourceAdapter not allowed for inputTypeSpecs: ${inputType}: ${DataAdapterString}`);
  }

}

const mapNameToDataAdapter: Record<string, ProviderToken<DataAdapterBase>> = {
  [PickerConfigs.UiPickerSourceCustomList]: DataAdapterString,
  [PickerConfigs.UiPickerSourceCustomCsv]: DataAdapterString,
  [PickerConfigs.UiPickerSourceQuery]: DataAdapterQuery,
  [PickerConfigs.UiPickerSourceEntity]: DataAdapterEntity,
};

/**
 * Catalog of the parts to be used for each picker type.
 * This includes what data-sources and state-adapters to use.
 * For older pickers, a predefined source is used.
 */
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
  [InputTypeCatalog.EntityDefault]: {
    sources: [DataAdapterEntity],
    states: [StateAdapterEntity],
    forcePickerConfig: PickerConfigs.UiPickerSourceEntity,
  },
  [InputTypeCatalog.EntityQuery]: {
    sources: [DataAdapterQuery],
    states: [StateAdapterEntity],
    forcePickerConfig: PickerConfigs.UiPickerSourceQuery,
  },
  [InputTypeCatalog.EntityPicker]: {
    sources: [DataAdapterEntity, DataAdapterQuery],
    states: [StateAdapterEntity],
  },
};

interface PartMap {
  sources: ProviderToken<unknown>[],
  states: ProviderToken<unknown>[],
  /** Force some string-sources to assume no-configuration, since the config is in the classic metadata, not in a DataSource config */
  forcePickerConfig?: OfPickerConfig,
}
