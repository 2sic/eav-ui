import { FieldSettings } from 'projects/edit-types';
import { EavLogger } from '../../shared/logging/eav-logger';
import { FieldLogicManager } from '../fields/logic/field-logic-manager';
import { FieldProps } from './fields-configs.model';

const logSpecs = {
  enabled: true,
  name: 'FieldTranslationInfo',
};

export class FieldTranslationInfo implements Pick<FieldSettings, 'DisableTranslation' | 'DisableAutoTranslation'> {

  log = new EavLogger(logSpecs);

  constructor(private getFieldsProps: () => FieldProps) { }

  get #settings(): FieldSettings { return this.#_settings ??= this.getFieldsProps().settings; }
  #_settings: FieldSettings;

  get isAutoTranslatable(): boolean { return !this.DisableTranslation && !this.DisableAutoTranslation; }

  get notForAutoTranslateBecauseOfType(): boolean { return !this.DisableTranslation && this.autoTranslateIsDisabledByTypeButNotByConfig(); }

  get DisableTranslation(): boolean { return this.#settings.DisableTranslation; }

  get DisableAutoTranslation(): boolean { return this.#settings.DisableAutoTranslation; }

  /**
   * Returns true if auto translation is enabled for the field, but was disabled by default because of the field type.
   * This is meant to spot "additional" disabled fields which should be added to a list of fields that should not be translated.
   * ...this is a bit ugly...
   */
  autoTranslateIsDisabledByTypeButNotByConfig() {
    // first check if it's already disabled - in which case we say "false"
    // so it's not added (again) to lists of Fields that should not be translated
    if (this.DisableAutoTranslation) return false;
    const logic = FieldLogicManager.singleton().get(this.getFieldsProps().constants.inputTypeSpecs.inputType);
    return !logic.canAutoTranslate;
  }
}
