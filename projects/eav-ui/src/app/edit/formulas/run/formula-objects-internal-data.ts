import { Signal } from '@angular/core';
import { FeatureSummary } from '../../../features/models';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { InputTypeStrict } from '../../../shared/fields/input-type-catalog';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FormConfigService } from '../../form/form-config.service';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { Language } from '../../../shared/models/language.model';
import { FormLanguage } from '../../form/form-languages.model';
import { ItemService } from '../../state/item.service';

/** Everything a formula needs to run */
export interface FormulaRunParameters {
  /** The formula to run */
  formula: FormulaCacheItem;
  currentValues: ItemValuesOfLanguage;
  /** The exact name of the input field */
  inputTypeName: InputTypeStrict;
  settingsInitial: FieldSettings;
  settingsCurrent: FieldSettings;
  itemHeader: Pick<ItemIdentifierShared, "Prefill" | "ClientData">;
  item?: PickerItem;
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
}

export interface FormulaExecutionSpecsWithRunParams extends FormulaExecutionSpecs {
  runParameters: FormulaRunParameters;
}