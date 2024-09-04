import { Sxc } from '@2sic.com/2sxc-typings';
import { FormulaTargets, FormulaV1Context, FormulaV1CtxApp, FormulaV1CtxCulture, FormulaV1CtxFeatures, FormulaV1CtxForm, FormulaV1CtxTarget, FormulaV1CtxTargetEntity, FormulaV1CtxUser, FormulaVersions } from '../models/formula.models';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';

export class FormulaContextObject implements FormulaV1Context {

  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  cache: Record<string, any>;
  debug: boolean;
  sxc: Sxc;
  user: FormulaV1CtxUser;
  app: FormulaV1CtxApp;
  culture: FormulaV1CtxCulture;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
    const definition = propsData.runParameters.formula;
    this.cache = definition.cache;
    this.debug = propsData.debugEnabled;
    this.sxc = definition.sxc;
    this.user = definition.user;

    this.app = Object.assign(new FormulaContextApp(propsData), propsData.runParameters.formula.app);

    this.target = new FormulaContextTarget(propsData);

    const language = propsData.language;
    const languages = propsData.languages
    this.culture = {
      code: language.current,
      name: languages.find(l => l.NameId === language.current)?.Culture,
    };

    this.features = {
      isEnabled(name: string): boolean {
        return propsData.features().find(f => f.nameId === name)?.isEnabled ?? false;
      },
    };

    this.form = {
      runFormulas(): void {
        if (definition.version === FormulaVersions.V1) {
          console.error('form.runFormulas() is being deprecated and will stop working end of 2024. Use V2 formulas and return the promise. Formulas will auto-run when it completes.');
          propsData.fieldsSettingsService.retriggerFormulas('form.runFormulas()');
        } else if (definition.version === FormulaVersions.V2) {
          console.error('form.runFormulas() is not supported in V2 formulas. Just return the promise.');
        }
      },
    };
  }
  
  features: FormulaV1CtxFeatures;
  form: FormulaV1CtxForm;
  target: FormulaV1CtxTarget;
}

class FormulaContextApp implements FormulaV1CtxApp {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
  }

  appId: number;
  zoneId: number;
  isGlobal: boolean;
  isSite: boolean;
  isContent: boolean;
  getSetting(settingPath: string) {
    const definition = this.#propsData.runParameters.formula;
    const formConfig = this.#propsData.formConfig;
    if (definition.version === FormulaVersions.V1) {
      console.warn('app.getSetting() is not available in v1 formulas, please use v2.');
      return '⚠️ error - see console';
    }
    const result = formConfig.config.settings.Values[settingPath];
    if (result != null)
      return result;
    console.warn(`Error: Setting '${settingPath}' not found. Did you configure it in the ContentType to be included? ` +
      `See https://go.2sxc.org/formulas`);
    return '⚠️ error - see console';
  }
}

class FormulaContextTarget implements FormulaV1CtxTarget {

  entity: FormulaV1CtxTargetEntity;
  name: string;
  type: string;

  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
    const definition = propsData.runParameters.formula;
    this.entity = definition.targetEntity;
    this.name = definition.target === FormulaTargets.Value || definition.target === FormulaTargets.Validation
      ? definition.fieldName
      : definition.target.substring(definition.target.lastIndexOf('.') + 1);
    this.type = definition.target === FormulaTargets.Value || definition.target === FormulaTargets.Validation
      ? definition.target
      : definition.target.substring(0, definition.target.lastIndexOf('.'))
  }

}