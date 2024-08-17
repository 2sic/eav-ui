import { Signal } from '@angular/core';
import { FeatureSummary } from '../../../features/models';
import { FormValues, Language } from '../../shared/models';
import { FormLanguage } from '../../shared/models/form-languages.model';
import { FormConfigService, FieldsSettingsService } from '../../shared/services';
import { ItemService } from '../../shared/store/ngrx-data';
import { FormulaRunParameters } from '../formula-engine';

export interface FormulaObjectsInternalWithoutFormulaItself {
  initialFormValues: FormValues;
  language: FormLanguage;
  languages: Language[];
  debugEnabled: boolean;
  itemService: ItemService;
  formConfig: FormConfigService;
  fieldsSettingsService: FieldsSettingsService;
  features: Signal<FeatureSummary[]>;
}

export interface FormulaObjectsInternalData extends FormulaObjectsInternalWithoutFormulaItself {
  runParameters: FormulaRunParameters;
}