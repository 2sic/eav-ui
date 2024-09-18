import { Sxc } from '@2sic.com/2sxc-typings';
import { FormulaVersions } from '../formula-definitions';
import { FormulaV1Context, FormulaV1CtxApp, FormulaV1CtxCulture, FormulaV1CtxFeatures, FormulaV1CtxForm, FormulaV1CtxTarget, FormulaV1CtxTargetEntity, FormulaV1CtxUser } from './formula-run-context.model';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { FormulaExperimentalObject } from './formula-experimental-object';

/**
 * The object containing context information.
 * Usually given to a formula on the second parameter.
 * eg v2((data, CTX) => { ... })
 */
export class FormulaContextObject implements FormulaV1Context {

  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;

  cache: Record<string, any>;
  debug: boolean;
  sxc: Sxc;
  user: FormulaV1CtxUser;
  app: FormulaV1CtxApp;
  culture: FormulaV1CtxCulture;

  constructor(propsData: FormulaExecutionSpecsWithRunParams, experimental: FormulaExperimentalObject) {
    this.#propsData = propsData;
    const formula = propsData.runParameters.formula;
    this.cache = formula.cache;
    this.debug = propsData.debugEnabled;
    this.sxc = formula.sxc;
    this.user = formula.user;

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
        if (formula.version === FormulaVersions.V1) {
          console.error('form.runFormulas() is being deprecated and will stop working end of 2024. Use V2 formulas and return the promise. Formulas will auto-run when it completes.');
          propsData.fieldsSettingsSvc.retriggerFormulas('form.runFormulas()');
        } else if (formula.version === FormulaVersions.V2) {
          console.error('form.runFormulas() is not supported in V2 formulas. Just return the promise.');
        }
      },
    };
  }
  
  features: FormulaV1CtxFeatures;
  form: FormulaV1CtxForm;
  target: FormulaV1CtxTarget;
}

/**
 * The object containing app context information.
 * Usually on the context.app property.
 */
class FormulaContextApp implements FormulaV1CtxApp {
  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
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

/**
 * The object containing formula target information.
 * So it says what the formula is for, which entity, field, setting/value etc.
 * Usually on the context.target property.
 */
class FormulaContextTarget implements FormulaV1CtxTarget {

  entity: FormulaV1CtxTargetEntity;
  name: string;
  type: string;

  /** Private variable containing the data used in the getters */
  #propsData: FormulaExecutionSpecsWithRunParams;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#propsData = propsData;
    const def = propsData.runParameters.formula;
    this.entity = def.targetEntity;

    // Name and type are truncated from the original target string if it's a setting
    const isValueOrValidation = def.isValue || def.isValidation;
    this.name = isValueOrValidation
      ? def.fieldName
      : def.target.substring(def.target.lastIndexOf('.') + 1);
    this.type = isValueOrValidation
      ? def.target
      : def.target.substring(0, def.target.lastIndexOf('.'))
  }

}