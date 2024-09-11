import { inject, Injectable } from '@angular/core';
import { FormulaExecutionSpecs } from './run/formula-objects-internal-data';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { EditInitializerService } from '../form/edit-initializer.service';
import { FormConfigService } from '../form/form-config.service';
import { LanguageService } from '../localization/language.service';
import { ItemService } from '../state/item.service';
import { FeaturesService } from '../../features/features.service';
import { FieldsSettingsService } from '../state/fields-settings.service';

@Injectable()
export class FormulaExecutionSpecsFactory {

  #features = inject(FeaturesService).getAll();
  
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageSvc: LanguageService,
    private globalConfigSvc: GlobalConfigService,
    private editInitializerSvc: EditInitializerService,
  ) { }

  init(entityGuid: string, settingsSvc: FieldsSettingsService) {
    this.#entityGuid = entityGuid;
    this.#settingsSvc = settingsSvc;
  }

  // properties to set on init
  #entityGuid: string;
  #settingsSvc: FieldsSettingsService;
  
  /**
   * Get all objects which are needed for the data and context and are reused quite a few times.
   * Can be reused for a short time, as the data doesn't change in a normal cycle,
   * but it will need to be regenerated after things such as language or feature change.
   */
  prepareDataForFormulaObjects(): FormulaExecutionSpecs {
    const language = this.formConfig.language();
    const languages = this.languageSvc.getAll();
    const debugEnabled = this.globalConfigSvc.isDebug();
    const initialFormValues = this.editInitializerSvc.getInitialValues(this.#entityGuid, language.current);
    return {
      initialFormValues,
      language,
      languages,
      debugEnabled,
      itemService: this.itemService,
      formConfig: this.formConfig,
      fieldsSettingsSvc: this.#settingsSvc,
      features: this.#features,
    } satisfies FormulaExecutionSpecs;
  }
}