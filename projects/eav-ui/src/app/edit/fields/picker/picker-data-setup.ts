import { Injector, ProviderToken } from '@angular/core';
import { FieldSettingsPicker } from 'projects/edit-types/src/FieldSettings-Pickers';
import { Of, transient } from '../../../../../../core';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { classLog } from '../../../shared/logging';
import { FieldState } from '../field-state';
import { DataAdapterAppAssets } from './adapters/data-adapter-app-assets';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { DataAdapterCss } from './adapters/data-adapter-css';
import { DataAdapterEmpty } from './adapters/data-adapter-empty';
import { DataAdapterEntity } from './adapters/data-adapter-entity';
import { DataAdapterEntityBase } from './adapters/data-adapter-entity-base';
import { DataAdapterQuery } from './adapters/data-adapter-query';
import { DataAdapterString } from './adapters/data-adapter-string';
import { StateAdapter } from './adapters/state-adapter';
import { StateUiMapperBase } from './adapters/state-ui-mapper-base';
import { StateUiMapperNoop } from './adapters/state-ui-mapper-noop';
import { StateUiMapperNumberArray } from './adapters/state-ui-mapper-number-array';
import { StateUiMapperStringArray } from './adapters/state-ui-mapper-string-array';
import { PickerConfigs } from './constants/picker-config-model.constants';
import { PickerData } from './picker-data';

/**
 * Factory for creating PickerData instances.
 * Goal is to move all the logic for which combination of input types
 * result in what states etc. to here.
 */
export class PickerDataSetup {

  log = classLog({ PickerDataSetup }, null);

  constructor(private injector: Injector) { }

  // Notes: previous flow of initialization
  // 1. Final control (eg. StringPickerComponent) gets services which it will use using transient(...)
  // ... and also importMe on the logic
  // 2. PickerComponent.ngOnInit() will
  // ...
  // 3. The control will override initAdaptersAndModel()
  // 3.1 init state with
  // ... it will also attach a CALLBACK! for focused?

  /**
   * Setup / initialize a Picker Data.
   * Note that it can't be called when fields are being created, but must be called from inside each field.
   * Reason is that objects created later on through DI will need the FieldState and other context objects to be injected.
   */
  setupPickerData(pickerData: PickerData, fieldState: FieldState<FieldValue>): PickerData {
    const pdWithSetupState = pickerData as PickerData & { setupAlreadyStarted: boolean };
    const alreadyStarted = pdWithSetupState.setupAlreadyStarted;
    const inputType = fieldState.config.inputTypeSpecs.inputType;
    const l = this.log.fn('createPickerAdapters', { pickerData, fieldState, inputType, alreadyStarted });
    if (alreadyStarted)
      return l.rSilent(pickerData, 'exist, already started');
    
    pdWithSetupState.setupAlreadyStarted = true;

    // First get the state, since the sources will depend on it.
    const state = this.#getStateAdapter(fieldState.name, inputType, fieldState.settings as ConstructorParameters<typeof StateUiMapperBase>[1]);

    const dataSourceType = (fieldState.settings() as FieldSettings & FieldSettingsPicker).dataSourceType;
    const source = this.#getSourceAdapter(inputType, dataSourceType, state);

    pickerData.setup(fieldState.name, fieldState.settings, state, source);

    // l.end('ok', { state, source });

    // Perform any post-init actions for the source - ATM only on Entity/Query
    (pickerData.source as DataAdapterEntityBase)?.onAfterViewInit?.();
    
    return l.rSilent(pickerData);
  }

  #getStateAdapter(fieldName: string, inputType: Of<typeof InputTypeCatalog>, settings: ConstructorParameters<typeof StateUiMapperBase>[1]): StateAdapter {
    const uiMapperType = partsMap[inputType]?.uiMapper as typeof StateUiMapperNoop;
    if (!uiMapperType)
      throw new Error(`No State Adapter found for inputTypeSpecs: ${inputType}`);

    const stateAdapter = transient(StateAdapter, this.injector);
    const uiMapper = new uiMapperType(fieldName, settings);
    stateAdapter.setup(fieldName, uiMapper);
    return stateAdapter;
  }

  #getSourceAdapter(inputType: Of<typeof InputTypeCatalog>, dataSourceType: string, state: StateAdapter): DataAdapterBase {
    const l = this.log.fn('getSourceAdapter', { inputType, dataSourceType });
    // Get config for allowed sources / adapters for the current inputType
    const parts = partsMap[inputType];

    // The config type is either the forced type (from defaults for old pickers) or the specified type
    const dsType = parts.forcePickerConfig ?? dataSourceType;
    l.a(`use config type`, { dataSourceType, forcePickerConfig: parts.forcePickerConfig, dsType });

    const dataAdapterType = mapNameToDataAdapter[dsType] ?? DataAdapterEmpty;
    this.#throwIfSourceAdapterNotAllowed(inputType, dataAdapterType);
    const result = transient(dataAdapterType, this.injector).connectState(state);
    return l.r(result);
  }

  #throwIfSourceAdapterNotAllowed(inputType: Of<typeof InputTypeCatalog>, dataSourceType: ProviderToken<unknown>): boolean {
    // Empty is always allowed, as it's usually for errors / missing configs
    if (dataSourceType === DataAdapterEmpty) return false;
    if (partsMap[inputType]?.sources?.includes(dataSourceType)) return false;
    throw new Error(`Specified SourceAdapter not allowed for inputTypeSpecs: ${inputType}: ${DataAdapterString}`);
  }

}

const mapNameToDataAdapter: Record<string, ProviderToken<DataAdapterBase>> = {
  [PickerConfigs.UiPickerSourceCustomList]: DataAdapterString,
  [PickerConfigs.UiPickerSourceCustomCsv]: DataAdapterString,
  [PickerConfigs.UiPickerSourceCss]: DataAdapterCss,
  [PickerConfigs.UiPickerSourceQuery]: DataAdapterQuery,
  [PickerConfigs.UiPickerSourceEntity]: DataAdapterEntity,
  [PickerConfigs.UiPickerSourceAppAssets]: DataAdapterAppAssets,
};

/**
 * Catalog of the parts to be used for each picker type.
 * This includes what data-sources and state-adapters to use.
 * For older pickers, a predefined source is used.
 */
const partsMap: Record<string, PartMap> = {
  [InputTypeCatalog.StringPicker]: {
    sources: [DataAdapterString, DataAdapterQuery, DataAdapterEntity, DataAdapterCss, DataAdapterAppAssets],
    uiMapper: StateUiMapperStringArray,
  },
  [InputTypeCatalog.StringDropdown]: {
    sources: [DataAdapterString],
    uiMapper: StateUiMapperStringArray,
    forcePickerConfig: PickerConfigs.UiPickerSourceCustomList,
  },

  [InputTypeCatalog.StringFontIconPicker]: {
    sources: [DataAdapterCss],
    uiMapper: StateUiMapperStringArray,
    forcePickerConfig: PickerConfigs.UiPickerSourceCss,
  },

  [InputTypeCatalog.NumberDropdown]: {
    sources: [DataAdapterString],
    uiMapper: StateUiMapperNumberArray,
    forcePickerConfig: PickerConfigs.UiPickerSourceCustomList,
  },

  [InputTypeCatalog.NumberPicker]: {
    sources: [DataAdapterString, DataAdapterQuery, DataAdapterEntity],
    uiMapper: StateUiMapperNumberArray,
  },
  [InputTypeCatalog.StringDropdownQuery]: {
    sources: [DataAdapterQuery],
    uiMapper: StateUiMapperStringArray,
    forcePickerConfig: PickerConfigs.UiPickerSourceQuery,
  },
  [InputTypeCatalog.EntityDefault]: {
    sources: [DataAdapterEntity],
    uiMapper: StateUiMapperNoop,
    forcePickerConfig: PickerConfigs.UiPickerSourceEntity,
  },
  [InputTypeCatalog.EntityQuery]: {
    sources: [DataAdapterQuery],
    uiMapper: StateUiMapperNoop,
    forcePickerConfig: PickerConfigs.UiPickerSourceQuery,
  },
  [InputTypeCatalog.EntityContentBlocks]: {
    sources: [DataAdapterEntity],
    uiMapper: StateUiMapperNoop,
    forcePickerConfig: PickerConfigs.UiPickerSourceEntity,
  },
  [InputTypeCatalog.EntityPicker]: {
    sources: [DataAdapterEntity, DataAdapterQuery, DataAdapterString],
    uiMapper: StateUiMapperNoop,
  },
};

interface PartMap {
  /** The allowed source adapters for this input type */
  sources: ProviderToken<unknown>[],

  /** The UI mapper to convert between state and UI representations */
  uiMapper: typeof StateUiMapperBase | typeof StateUiMapperStringArray | typeof StateUiMapperNumberArray,

  /** Force some string-sources to assume no-configuration, since the config is in the classic metadata, not in a DataSource config */
  forcePickerConfig?: Of<typeof PickerConfigs>,
}
