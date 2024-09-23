import { inject, Injectable } from '@angular/core';
import { FeaturesScopedService } from '../../features/features-scoped.service';
import { ItemIdentifierShared } from '../../shared/models/edit-form.model';
import { GlobalConfigService } from '../../shared/services/global-config.service';
import { EditInitializerService } from '../form/edit-initializer.service';
import { FormConfigService } from '../form/form-config.service';
import { LanguageService } from '../localization/language.service';
import { FieldsSettingsService } from '../state/fields-settings.service';
import { ItemService } from '../state/item.service';
import { FormulaPropsParameters } from './formula-run-one-helpers.factory';
import { FormulaExecutionSpecs } from './run/formula-objects-internal-data';

/**
 * Factory for creating FormulaExecutionSpecs objects.
 * These are parameters needed to run formulas, which are reused quite a few times.
 */
@Injectable()
export class FormulaExecutionSpecsFactory {

  #features = inject(FeaturesScopedService).getAll();
  
  constructor(
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private languageSvc: LanguageService,
    private globalConfigSvc: GlobalConfigService,
    private editInitializerSvc: EditInitializerService,
  ) { }

  init(settingsSvc: FieldsSettingsService, entityGuid: string, clientData: Pick<ItemIdentifierShared, "ClientData">) {
    this.#entityGuid = entityGuid;
    this.#settingsSvc = settingsSvc;
    this.#clientData = clientData;
  }

  // properties to set on init
  #entityGuid: string;
  #settingsSvc: FieldsSettingsService;
  #clientData: Pick<ItemIdentifierShared, "ClientData">;
  
  #warningsObsolete: Record<string, boolean> = {};

  /**
   * Get all objects which are needed for the data and context and are reused quite a few times.
   * Can be reused for a short time, as the data doesn't change in a normal cycle,
   * but it will need to be regenerated after things such as language or feature change.
   */
  getSharedSpecs(): FormulaExecutionSpecs {
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
      parameters: new FormulaPropsParameters(this.#clientData.ClientData?.parameters ?? {}),
      warningsObsolete: this.#warningsObsolete,
    } satisfies FormulaExecutionSpecs;
  }
}