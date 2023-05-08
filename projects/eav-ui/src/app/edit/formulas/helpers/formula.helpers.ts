import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { FeatureSummary } from '../../../features/models';
import { DesignerSnippet, FieldOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { InputFieldHelpers, LocalizationHelpers } from '../../shared/helpers';
import { FormValues, Language } from '../../shared/models';
import { EavHeader } from '../../shared/models/eav';
import { EavService, FieldsSettingsService } from '../../shared/services';
import { ItemService } from '../../shared/store/ngrx-data';

// Import the type definitions for intellisense
import editorTypesForIntellisense from '!raw-loader!../editor-intellisense-function-v2.rawts';
import { formV1Prefix, requiredFormulaPrefix } from '../formula.constants';
// tslint:disable-next-line: max-line-length
import { FormulaCacheItem, FormulaFieldValidation, FormulaFunction, FormulaProps, FormulaPropsV1, FormulaTargets, FormulaV1Data, FormulaV1ExperimentalEntity, FormulaVersion, FormulaVersions, SettingsFormulaPrefix } from '../models/formula.models';

export class FormulaHelpers {

  private static cleanFormula(formula: string): string {
    if (!formula) { return formula; }

    // Clean and remove any leading single-line comments
    let cleanFormula = formula.trim();
    if (cleanFormula.startsWith('//')) {
      cleanFormula = cleanFormula.replace(/^\/\/.*\n/gm, '').trim();
    }
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

    if (cleanFormula.startsWith(formV1Prefix)) {
      cleanFormula = `${requiredFormulaPrefix}${cleanFormula}`;
    } else if (cleanFormula.startsWith(`${requiredFormulaPrefix}${formV1Prefix}`)) {
      cleanFormula = cleanFormula;
    } else if (cleanFormula.startsWith('v2(')) {
      cleanFormula = cleanFormula.substring(3, cleanFormula.lastIndexOf('}') + 1);
      cleanFormula = cleanFormula.replace('=>', '');
      cleanFormula = `${requiredFormulaPrefix}v2 ${cleanFormula}`;
    }
    return cleanFormula;
  }

  static findFormulaVersion(formula: string): FormulaVersion {
    const cleanFormula = this.cleanFormula(formula);
    const versionPart = cleanFormula.substring(requiredFormulaPrefix.length, cleanFormula.indexOf('(')).trim();
    const validVersions = Object.values(FormulaVersions);

    return (validVersions).includes(versionPart as FormulaVersion)
      ? versionPart as FormulaVersion
      : undefined;
  }

  static buildFormulaFunction(formula: string): FormulaFunction {
    const cleanFormula = this.cleanFormula(formula);
    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }

  static buildFormulaProps(
    formula: FormulaCacheItem,
    entityId: number,
    inputType: InputType,
    settingsInitial: FieldSettings,
    settingsCurrent: FieldSettings,
    formValues: FormValues,
    initialFormValues: FormValues,
    currentLanguage: string,
    defaultLanguage: string,
    languages: Language[],
    itemHeader: EavHeader,
    debugEnabled: boolean,
    itemService: ItemService,
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    features: FeatureSummary[],
  ): FormulaProps {
    // console.log('2dm - buildFormulaProps()');
    switch (formula.version) {
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
              if (formula.target === FormulaTargets.Value) {
                return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settingsInitial);
              }
              if (formula.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = formula.target.substring(SettingsFormulaPrefix.length);
                return (settingsInitial as Record<string, any>)[settingName];
              }
            },
          },
          initial: {
            get(): FieldValue {
              if (formula.target !== FormulaTargets.Value) { return; }
              return initialFormValues[formula.fieldName];
            },
          },
          parameters: {
            get(): Record<string, any> {
              return FormulaHelpers.buildFormulaPropsParameters(itemHeader);
            },
          },
          prefill: {
            get(): FieldValue {
              if (formula.target !== FormulaTargets.Value) { return; }
              return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settingsInitial, itemHeader, true);
            },
          },
          value: {
            get(): FieldValue {
              if (formula.target === FormulaTargets.Value) {
                return formValues[formula.fieldName];
              }
              if (formula.target === FormulaTargets.Validation) {
                const formulaValidation: FormulaFieldValidation = {
                  severity: '',
                  message: '',
                };
                return formulaValidation as unknown as FieldValue;
              }
              if (formula.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = formula.target.substring(SettingsFormulaPrefix.length);
                return (settingsCurrent as Record<string, any>)[settingName];
              }
            },
          },
        });

        const propsV1: FormulaPropsV1 = {
          data,
          context: {
            app: {
              ...formula.app,
              getSetting: (settingPath: string) => {
                if (formula.version === FormulaVersions.V1) {
                  console.warn('app.getSetting() is not available in v1 formulas, please use v2.');
                  return '⚠️ error - see console';
                }
                const result = eavService.eavConfig.settings.Values[settingPath];
                if (result != null) return result;
                console.warn(`Error: Setting '${settingPath}' not found. Did you configure it in the ContentType to be included? ` +
                  `See https://r.2sxc.org/formulas`);
                return '⚠️ error - see console';
              },
            },
            cache: formula.cache,
            culture: {
              code: currentLanguage,
              name: languages.find(l => l.NameId === currentLanguage)?.Culture,
            },
            debug: debugEnabled,
            features: {
              isEnabled(name: string): boolean {
                return features.find(f => f.NameId === name)?.Enabled ?? false;
              },
            },
            form: {
              runFormulas(): void {
                if (formula.version === FormulaVersions.V1) {
                  console.warn('form.runFormulas() is being deprecated. Use V2 formulas and return the promise. Formulas will auto-run when it completes.');
                  fieldsSettingsService.retriggerFormulas();
                } else if (formula.version === FormulaVersions.V2) {
                  console.error('form.runFormulas() is not supported in V2 formulas. Just return the promise. Formulas will auto-run when it completes.');
                }
              },
            },
            // WIP v14.11 move sxc to cache like app - must watch a bit till ca. Dec 2022 to ensure caching is ok for this
            sxc: formula.sxc,
            target: {
              entity: formula.targetEntity,
              name: formula.target === FormulaTargets.Value || formula.target === FormulaTargets.Validation
                ? formula.fieldName
                : formula.target.substring(formula.target.lastIndexOf('.') + 1),
              type: formula.target === FormulaTargets.Value || formula.target === FormulaTargets.Validation
                ? formula.target
                : formula.target.substring(0, formula.target.lastIndexOf('.')),
            },
            user: formula.user,
          },
          experimental: {
            getEntities(): FormulaV1ExperimentalEntity[] {
              const v1Entities = itemService.getItems(eavService.eavConfig.itemGuids).map(item => {
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
                values[fieldName] = LocalizationHelpers.translate(currentLanguage, defaultLanguage, fieldValues, null);
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

  static buildFormulaPropsParameters(itemHeader: EavHeader): Record<string, any> {
    return JSON.parse(JSON.stringify(itemHeader.Prefill)) ?? {};
  }

  static buildDesignerSnippetsData(formula: FormulaCacheItem, fieldOptions: FieldOption[], itemHeader: EavHeader): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const formulaPropsParameters = this.buildFormulaPropsParameters(itemHeader);
        const snippets = [
          'value',
          'default',
          'prefill',
          'initial',
          ...fieldOptions.map(f => f.fieldName),
          'parameters.ChangeThis',
          ...Object.keys(formulaPropsParameters).map(key => `parameters.${key}`),
        ].map(name => {
          const code = `data.${name}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });
        return snippets;
      default:
        return;
    }
  }

  static buildDesignerSnippetsContext(formula: FormulaCacheItem): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const snippets = [
          'app.appId',
          'app.zoneId',
          'app.isGlobal',
          'app.isSite',
          'app.isContent',
          'cache.ChangeThis',
          'culture.code',
          'culture.name',
          'debug',
          'features.isEnabled(\'NameId\')',
          'form.runFormulas()',
          'sxc.ChangeThis',
          'target.entity.id',
          'target.entity.guid',
          'target.name',
          'target.type',
          'user.id',
          'user.isAnonymous',
          'user.isSiteAdmin',
          'user.isSystemAdmin',
        ].map(name => {
          const code = `context.${name}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });
        return snippets;
      default:
        return;
    }
  }

  static buildFormulaTypings(formula: FormulaCacheItem, fieldOptions: FieldOption[], itemHeader: EavHeader): string {
    switch (formula.version) {
      case FormulaVersions.V2: {
        const formulaPropsParameters = this.buildFormulaPropsParameters(itemHeader);

        const allFields = fieldOptions.map(f => `${f.fieldName}: any;`).join('\n');
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
}
