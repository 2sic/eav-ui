import { Sxc } from '@2sic.com/2sxc-typings';
import { FormulaVersions } from '../formula-definitions';
import { FormulaV1Context, FormulaV1CtxApp, FormulaV1CtxCulture, FormulaV1CtxFeatures, FormulaV1CtxForm, FormulaV1CtxTarget, FormulaV1CtxTargetEntity, FormulaV1CtxUser } from './formula-run-context.model';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { FormulaExperimentalObject } from './formula-experimental-object';
import { FormulaContextEntityInfo } from './formula-run-experimental.model';

/**
 * The object containing context information.
 * Usually given to a formula on the second parameter.
 * eg v2((data, CTX) => { ... })
 */
export class FormulaContextObject implements FormulaV1Context {

  cache: Record<string, any>;
  debug: boolean;
  sxc: Sxc;
  user: FormulaV1CtxUser;
  app: FormulaV1CtxApp;
  culture: FormulaV1CtxCulture;

  /**
   * new v18.01
   */
  entities: FormulaContextEntities;

  features: FormulaV1CtxFeatures;
  form: FormulaV1CtxForm;
  target: FormulaV1CtxTarget;

  xp: FormulaExperimentalObject;

  constructor(specs: FormulaExecutionSpecsWithRunParams, experimental: FormulaExperimentalObject) {
    const formula = specs.runParameters.formula;
    this.cache = formula.cache;
    this.debug = specs.debugEnabled;
    this.sxc = formula.sxc;
    this.user = formula.user;

    // Build the App, but don't include the getSetting method which would be an empty method
    const { getSetting, ...partialApp } = specs.runParameters.formula.app;
    this.app = Object.assign(new FormulaContextApp(specs), partialApp);

    this.target = new FormulaContextTarget(specs);

    const language = specs.language;
    const languages = specs.languages
    this.culture = {
      code: language.current,
      name: languages.find(l => l.NameId === language.current)?.Culture,
    };

    this.features = new FormulaContextFeatures(specs);

    this.form = new FormulaContextForm(specs);

    this.entities = new FormulaContextEntities(specs);

    this.xp = experimental;
  }

}

/**
 * new v18.01
 */
class FormulaContextEntities {
  constructor(private specs: FormulaExecutionSpecsWithRunParams) { }

  /**
   * 
   * @returns All entities in the context
   * new v18.01
   */
  getAll() {
    const v1Entities = this.specs.itemService.getMany(this.specs.formConfig.config.itemGuids).map(i => ({
      guid: i.Entity.Guid,
      id: i.Entity.Id,
      type: {
        guid: i.Entity.Type.Id,
        name: i.Entity.Type.Name,
      }
    } satisfies FormulaContextEntityInfo));
    return v1Entities;
  }

  /**
   * 
   * @param guidOrName 
   * @returns The first entity in the context which matches the guid or name
   * new v18.01
   */
  getOfType(guidOrName: string) {
    return this.getAll().find(a => a.type.guid == guidOrName || a.type.name == guidOrName);
  }
}

class FormulaContextFeatures implements FormulaV1CtxFeatures {
  constructor(private specs: FormulaExecutionSpecsWithRunParams) { }

  isEnabled(name: string): boolean {
    return this.specs.features().find(f => f.nameId === name)?.isEnabled ?? false;
  }
}

class FormulaContextForm implements FormulaV1CtxForm {
  constructor(private specs: FormulaExecutionSpecsWithRunParams) { }

  runFormulas(): void {
    const formula = this.specs.runParameters.formula;
    if (formula.version === FormulaVersions.V1) {
      console.error('form.runFormulas() is being deprecated and will stop working end of 2024. Use V2 formulas and return the promise. Formulas will auto-run when it completes.');
      this.specs.fieldsSettingsSvc.retriggerFormulas('form.runFormulas()');
      return;
    }
    
    console.error('form.runFormulas() is not supported in V2 formulas. Just return a promise.');
  }
}

/**
 * The object containing app context information.
 * Usually on the context.app property.
 * 
 * Note that most properties are assigned to this object from outside, which is why we don't initialize them.
 * This is because they are created once, and don't need to be re-created for each formula run.
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
    if (this.#propsData.runParameters.formula.version === FormulaVersions.V1) {
      console.warn('app.getSetting() is not available in v1 formulas, please use v2.');
      return '⚠️ error - see console';
    }

    const result = this.#propsData.formConfig.config.settings.Values[settingPath];
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