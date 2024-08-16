import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { FeatureSummary } from '../../../features/models';
import { FieldOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { InputFieldHelpers, LocalizationHelpers } from '../../shared/helpers';
import { FormValues, Language } from '../../shared/models';
import { FormConfigService, FieldsSettingsService } from '../../shared/services';
import { ItemService } from '../../shared/store/ngrx-data';

// Import the type definitions for intellisense
import editorTypesForIntellisense from '!raw-loader!../editor-intellisense-function-v2.rawts';
import { formV1Prefix, requiredFormulaPrefix } from '../formula.constants';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaFieldValidation, FormulaFunction, FormulaProps, FormulaPropsV1, FormulaTargets, FormulaV1Data, FormulaV1ExperimentalEntity, FormulaVersion, FormulaVersions, SettingsFormulaPrefix } from '../models/formula.models';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { InputTypeStrict } from '../../../content-type-fields/constants/input-type.constants';
import { FormLanguage } from '../../shared/models/form-languages.model';
import { FormulaRunParameters } from '../formula-engine';

/**
 * Contains methods for building formulas.
 */
export class FormulaHelpers {

  /**
   * Used to clean formula text.
   * @param formula Formula text to clean
   * @returns Cleaned formula text
   */
  private static cleanFormula(formula: string): string {
    if (!formula)
      return formula;

    // Clean and remove any leading single-line comments
    let cleanFormula = formula.trim();
    if (cleanFormula.startsWith('//'))
      cleanFormula = cleanFormula.replace(/^\/\/.*\n/gm, '').trim();

    /*
      Valid function string:
      function NAME (...ARGS) { BODY }

      Must build function string for these inputs:
      v1 (...ARGS) { BODY }
      function v1 (...ARGS) { BODY }
      v2((...ARGS) => { BODY });

      Everything else is ignored.
      TODO: do this properly with regex if it's not too slow
    */

    if (cleanFormula.startsWith(formV1Prefix))
      return `${requiredFormulaPrefix}${cleanFormula}`;
    
    if (cleanFormula.startsWith(`${requiredFormulaPrefix}${formV1Prefix}`))
      return cleanFormula;
    
    if (cleanFormula.startsWith('v2(')) {
      cleanFormula = cleanFormula.substring(3, cleanFormula.lastIndexOf('}') + 1);
      cleanFormula = cleanFormula.replace('=>', '');
      return `${requiredFormulaPrefix}v2 ${cleanFormula}`;
    }

    return cleanFormula;
  }

  /**
   * Used to find formula version.
   * @param formula Formula text
   * @returns If formula is V1 or V2
   */
  static findFormulaVersion(formula: string): FormulaVersion {
    const cleanFormula = this.cleanFormula(formula);
    const versionPart = cleanFormula.substring(requiredFormulaPrefix.length, cleanFormula.indexOf('(')).trim();
    const validVersions = Object.values(FormulaVersions);

    return (validVersions).includes(versionPart as FormulaVersion)
      ? versionPart as FormulaVersion
      : undefined;
  }

  /**
   * Used to build executable formula function from formula text.
   * @param formula Formula text
   * @returns Executable formula function
   */
  static buildFormulaFunction(formula: string): FormulaFunction {
    const cleanFormula = this.cleanFormula(formula);
    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }

  /**
   * Used to build formula props parameters.
   * @param formula
   * @param entityId
   * @param inputType
   * @param settingsInitial
   * @param settingsCurrent
   * @param formValues
   * @param initialFormValues
   * @param languages
   * @param itemHeader
   * @param debugEnabled
   * @param itemService
   * @param formConfig
   * @param fieldsSettingsService
   * @param features
   * @returns Formula properties
   */
  static buildFormulaProps(
    runParameters: FormulaRunParameters,
    inputType: InputTypeStrict,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    formValues: FormValues,
    initialFormValues: FormValues,
    language: FormLanguage,
    languages: Language[],
    itemHeader: ItemIdentifierShared,
    debugEnabled: boolean,
    itemService: ItemService,
    formConfig: FormConfigService,
    fieldsSettingsService: FieldsSettingsService,
    features: FeatureSummary[],
  ): FormulaProps {
    const definition = runParameters.formula;
    // console.log('2dm - buildFormulaProps()');
    switch (definition.version) {
      case FormulaVersions.V1:
      case FormulaVersions.V2:
        const data: FormulaV1Data = {
          ...formValues,
          get default() { return undefined as FieldValue; },
          get initial() { return undefined as FieldValue; },
          get parameters() { return undefined as Record<string, any>; },
          get prefill() { return undefined as FieldValue; },
          get value() { return undefined as FieldValue; },
          get settings() { return undefined as unknown; },
        };
        Object.defineProperties(data, {
          default: {
            get(): FieldValue {
              if (definition.target === FormulaTargets.Value)
                return InputFieldHelpers.parseDefaultValue(definition.fieldName, inputType, settingsInitial);
              if (definition.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = definition.target.substring(SettingsFormulaPrefix.length);
                return (settingsInitial as Record<string, any>)[settingName];
              }
            },
          },
          initial: {
            get(): FieldValue {
              if (definition.target !== FormulaTargets.Value) { return; }
              return initialFormValues[definition.fieldName];
            },
          },
          parameters: {
            get(): Record<string, any> {
              return FormulaHelpers.buildFormulaPropsParameters(itemHeader.ClientData?.parameters);
            },
          },
          prefill: {
            get(): FieldValue {
              if (definition.target !== FormulaTargets.Value) { return; }
              return InputFieldHelpers.parseDefaultValue(definition.fieldName, inputType, settingsInitial, itemHeader, true);
            },
          },
          value: {
            get(): FieldValue {
              if (definition.target === FormulaTargets.Value) {
                return formValues[definition.fieldName];
              }
              if (definition.target === FormulaTargets.Validation) {
                const formulaValidation: FormulaFieldValidation = {
                  severity: '',
                  message: '',
                };
                return formulaValidation as unknown as FieldValue;
              }
              if (definition.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = definition.target.substring(SettingsFormulaPrefix.length);
                return (settingsCurrent as Record<string, any>)[settingName];
              }
            },
          },
        });

        const propsV1: FormulaPropsV1 = {
          data,
          context: {
            app: {
              ...definition.app,
              getSetting: (settingPath: string) => {
                if (definition.version === FormulaVersions.V1) {
                  console.warn('app.getSetting() is not available in v1 formulas, please use v2.');
                  return '⚠️ error - see console';
                }
                const result = formConfig.config.settings.Values[settingPath];
                if (result != null) return result;
                console.warn(`Error: Setting '${settingPath}' not found. Did you configure it in the ContentType to be included? ` +
                  `See https://go.2sxc.org/formulas`);
                return '⚠️ error - see console';
              },
            },
            cache: definition.cache,
            culture: {
              code: language.current,
              name: languages.find(l => l.NameId === language.current)?.Culture,
            },
            debug: debugEnabled,
            features: {
              isEnabled(name: string): boolean {
                return features.find(f => f.nameId === name)?.isEnabled ?? false;
              },
            },
            form: {
              runFormulas(): void {
                if (definition.version === FormulaVersions.V1) {
                  console.warn('form.runFormulas() is being deprecated. Use V2 formulas and return the promise. Formulas will auto-run when it completes.');
                  fieldsSettingsService.retriggerFormulas();
                } else if (definition.version === FormulaVersions.V2) {
                  console.error('form.runFormulas() is not supported in V2 formulas. Just return the promise. Formulas will auto-run when it completes.');
                }
              },
            },
            // WIP v14.11 move sxc to cache like app - must watch a bit till ca. Dec 2022 to ensure caching is ok for this
            sxc: definition.sxc,
            target: {
              entity: definition.targetEntity,
              name: definition.target === FormulaTargets.Value || definition.target === FormulaTargets.Validation
                ? definition.fieldName
                : definition.target.substring(definition.target.lastIndexOf('.') + 1),
              type: definition.target === FormulaTargets.Value || definition.target === FormulaTargets.Validation
                ? definition.target
                : definition.target.substring(0, definition.target.lastIndexOf('.')),
            },
            user: definition.user,
          },
          experimental: {
            getEntities(): FormulaV1ExperimentalEntity[] {
              const v1Entities = itemService.getItems(formConfig.config.itemGuids).map(item => {
                const v1Entity: FormulaV1ExperimentalEntity = {
                  guid: item.Entity.Guid,
                  id: item.Entity.Id,
                  type: {
                    id: item.Entity.Type.Id,  // TODO: deprecate again, once we know it's not in use #cleanFormulaType
                    guid: item.Entity.Type.Id,
                    name: item.Entity.Type.Name,
                  }
                };
                return v1Entity;
              });
              return v1Entities;
            },
            getSettings(fieldName: string): FieldSettings {
              return fieldsSettingsService.getFieldSettings(fieldName);
            },
            getValues(entityGuid: string): FormValues {
              const item = itemService.getItem(entityGuid);
              const values: FormValues = {};
              for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes)) {
                values[fieldName] = LocalizationHelpers.translate(language, fieldValues, null);
              }
              return values;
            }
          }
        };
        return propsV1;
      default:
        return;
    }
  }

  /**
   * Used to build the formula props parameters as a record of key-value pairs.
   * @param prefillAsParameters
   * @returns
   */
  static buildFormulaPropsParameters(prefillAsParameters: Record<string, unknown>): Record<string, any> {
    return prefillAsParameters ? JSON.parse(JSON.stringify(prefillAsParameters)) : {};
  }


  /**
   * Used to build the formula typings for use in intellisense.
   * @param formula
   * @param fieldOptions
   * @param itemHeader
   * @returns Formula typings for use in intellisense
   */
  static buildFormulaTypings(formula: FormulaCacheItem, fieldOptions: FieldOption[], prefillAsParameters: Record<string, unknown>): string {
    switch (formula.version) {
      case FormulaVersions.V2: {
        const formulaPropsParameters = this.buildFormulaPropsParameters(prefillAsParameters);

        // debugger;

        const allFields = fieldOptions.map(f => `${f.fieldName}: ${this.inputTypeToDataType(f.inputType)};`).join('\n');
        const allParameters = Object.keys(formulaPropsParameters).map(key => `${key}: any;`).join('\n');
        const final = editorTypesForIntellisense
          .replace('/* [inject:AllFields] */', allFields)
          .replace('/* [inject:AllParameters] */', allParameters);

        // console.error('test 2dm', final);
        return final;

        // TODO: probably update the entity-type info which was added in v14.07.05
      }
      default:
        return;
    }
  }
  private static inputTypeToDataType(inputType: string) {
    const lower = inputType.toLowerCase();
    if (lower.startsWith('string')) return 'string';
    if (lower.startsWith('number')) return 'number';
    if (lower.startsWith('date')) return 'Date';
    if (lower.startsWith('boolean')) return 'boolean';
    return "any";
  }
}
