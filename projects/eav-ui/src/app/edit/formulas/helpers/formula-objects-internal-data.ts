import { Signal } from '@angular/core';
import { FeatureSummary } from '../../../features/models';
import { FormulaCacheItem } from '../models/formula.models';
import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { PickerItem } from '../../fields/picker/models/picker-item.model';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FormConfigService } from '../../state/form-config.service';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { Language } from '../../../shared/models/language.model';
import { FormLanguage } from '../../state/form-languages.model';
import { ItemService } from '../../shared/store/item.service';

/** Everything a formula needs to run */
export interface FormulaRunParameters {
  /** The formula to run */
  formula: FormulaCacheItem;
  currentValues: ItemValuesOfLanguage;
  /** The exact name of the input field */
  inputTypeName: InputTypeStrict;
  settingsInitial: FieldSettings;
  settingsCurrent: FieldSettings;
  itemHeader: ItemIdentifierShared;
  item?: PickerItem;
}

export interface FormulaObjectsInternalWithoutFormulaItself {
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
  fieldsSettingsService: FieldsSettingsService;
  features: Signal<FeatureSummary[]>;
}

export interface FormulaObjectsInternalData extends FormulaObjectsInternalWithoutFormulaItself {
  runParameters: FormulaRunParameters;
}