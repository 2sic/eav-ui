import { Injector, ProviderToken } from '@angular/core';
import { transient } from '../../../core';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { PickerData } from './picker-data';
import { FieldState } from '../field-state';
import { DataAdapterString } from './adapters/data-adapter-string';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { OfPickerConfig, PickerConfigs } from './constants/picker-config-model.constants';
import { DeleteEntityProps } from './models/picker.models';
import { StateAdapterString } from './adapters/state-adapter-string';
import { InputTypeCatalog, InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { StateAdapter } from './adapters/state-adapter';
import { StateAdapterEntity } from './adapters/state-adapter-entity';
import { classLog } from '../../../shared/logging';

/**
 * Factory for creating PickerData instances.
 * Goal is to move all the logic for which combination of input types
 * result in what states etc. to here.
 */
export class PickerDataFactory {

  log = classLog({PickerDataFactory});

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


  static createPickerData(inputType: InputTypeSpecs, injector: Injector): PickerData {
    return (InputTypeHelpers.isAnyPicker(inputType.inputType))
      ? transient(PickerData, injector)
      : null;
  }

  /**
   * Setup / initialize a Picker Data.
   * Note that it can't be called when fields are being created, but must be called from inside each field.
   * Reason is that objects created later on through DI will need the FieldState and other context objects to be injected.
   */
  setupPickerData(pickerData: PickerData, fieldState: FieldState<any>): PickerData {
    this.#setupPickerAdapters(pickerData, fieldState);
    pickerData.source.onAfterViewInit()
    return pickerData;
  }

  #setupPickerAdapters(pickerData: PickerData, fieldState: FieldState<any>): void {
    const inputType = fieldState.config.inputTypeSpecs.inputType;
    const l = this.log.fn('createPickerAdapters', { pickerData, fieldState, inputType });

    // First get the state, since the sources will depend on it.
    const state = this.#getStateAdapter(inputType).linkLog(this.log);

    const dataSourceType = fieldState.settings().DataSourceType;
    const source = this.#getSourceAdapter(inputType, dataSourceType, state);

    pickerData.setup(this.log.name, state, source);
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
