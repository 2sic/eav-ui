import { Signal } from '@angular/core';
import { FeatureSummary } from '../../../features/models';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FormConfigService } from '../../form/form-config.service';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { Language } from '../../../shared/models/language.model';
import { FormLanguage } from '../../form/form-languages.model';
import { ItemService } from '../../state/item.service';
import { StateUiMapperBase } from '../../fields/picker/adapters/state-ui-mapper-base';
import { FieldPropsPicker } from '../../state/fields-configs.model';
import { PickerData } from '../../fields/picker/picker-data';
import { FormulaFieldPickerHelper } from '../formula-field-picker.helper';
import { FieldDefaults } from '../../shared/input-types/input-field.helpers';
import { FormulaPropsParameters } from '../formula-run-one-helpers.factory';

export interface FormulaRunPicker extends FieldPropsPicker {
  listRaw: PickerItem[];
  verBefore: number | null;
  changed: boolean;
}

export interface FormulaRunPickers {
  /** Ready state, as it may need to wait for the picker-data to finish initialization */
  ready: boolean;

  /** The mapper to be used when returning the value to the UI */
  mapper: StateUiMapperBase;

  picker: PickerData,
  options: FormulaRunPicker;
  selected: FormulaRunPicker;

  changed: boolean;
}

/** Everything a formula needs to run */
export interface FormulaRunParameters {
  /** The formula to run */
  formula: FormulaCacheItem;
  currentValues: ItemValuesOfLanguage;
  settingsInitial: FieldSettings;
  settingsCurrent: FieldSettings;

  pickerHelper: FormulaFieldPickerHelper;

  defaultValueHelper: () => FieldDefaults;
}

export interface FormulaExecutionSpecs {
  /** Initial values so formulas can ask for .initial */
  initialFormValues: ItemValuesOfLanguage;

  /** current language information so all the commands / context work as expected */
  language: FormLanguage;

  /** all languages so we can provide a list with ISO code etc. */
  languages: Language[];

  /** Debug state so context.debug works */
  debugEnabled: boolean;

  /** Item service to allow retrieving other items */
  itemService: ItemService;
  formConfig: FormConfigService;

  /** This is needed by the experimental API to retrieve settings for any other field */
  fieldsSettingsSvc: FieldsSettingsService;
  features: Signal<FeatureSummary[]>;

  parameters: FormulaPropsParameters;

  warningsObsolete: Record<string, boolean>;
}

export interface FormulaExecutionSpecsWithRunParams extends FormulaExecutionSpecs {
  runParameters: FormulaRunParameters;
}