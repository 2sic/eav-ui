import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { FeatureSummary } from '../../../features/models';
import { FormValues, Language } from '../../shared/models';
import { FormLanguage } from '../../shared/models/form-languages.model';
import { FormConfigService, FieldsSettingsService } from '../../shared/services';
import { ItemService } from '../../shared/store/ngrx-data';
import { FormulaRunParameters } from '../formula-engine';


export interface FormulaObjectsInternalData {
  runParameters: FormulaRunParameters;
  inputType: InputTypeStrict;
  initialFormValues: FormValues;
  language: FormLanguage;
  languages: Language[];
  debugEnabled: boolean;
  itemService: ItemService;
  formConfig: FormConfigService;
  fieldsSettingsService: FieldsSettingsService;
  features: FeatureSummary[];
}
