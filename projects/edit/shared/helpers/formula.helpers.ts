import { InputFieldHelpers, LocalizationHelpers } from '.';
import { FieldSettings, FieldValue } from '../../../edit-types';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { FormValues } from '../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { DesignerSnippet, FieldOption } from '../../eav-item-dialog/multi-item-edit-form-debug/formula-designer/formula-designer.models';
// tslint:disable-next-line:max-line-length
import { FormulaCacheItem, FormulaFunction, FormulaProps, FormulaPropsV1, FormulaTargets, FormulaV1Data, FormulaV1ExperimentalEntity, FormulaVersion, FormulaVersions, Language, SettingsFormulaPrefix } from '../models';
import { EavHeader } from '../models/eav';
import { EavService, FieldsSettingsService } from '../services';
import { ItemService } from '../store/ngrx-data';

export class FormulaHelpers {

  static findFormulaVersion(formula: string): FormulaVersion {
    const cleanFormula = formula.trim();
    const typePart = cleanFormula.substring(0, cleanFormula.indexOf('(')).trim();

    switch (typePart) {
      case FormulaVersions.V1:
        return FormulaVersions.V1;
      default:
        return;
    }
  }

  static buildFormulaFunction(formula: string): FormulaFunction {
    const version = this.findFormulaVersion(formula);
    let cleanFormula = formula.trim();

    switch (version) {
      case FormulaVersions.V1:
        cleanFormula = `function ${cleanFormula.substring(FormulaVersions.V1.length).trim()}`;
        break;
      default:
        break;
    }

    const fn: FormulaFunction = new Function(`return ${cleanFormula}`)();
    return fn;
  }

  static buildFormulaProps(
    formula: FormulaCacheItem,
    entityId: number,
    inputType: InputType,
    settings: FieldSettings,
    previousSettings: FieldSettings,
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
  ): FormulaProps {

    switch (formula.version) {
      case FormulaVersions.V1:
        const data: FormulaV1Data = {
          ...formValues,
          get default() { return undefined as FieldValue; },
          get initial() { return undefined as FieldValue; },
          get prefill() { return undefined as FieldValue; },
          get value() { return undefined as FieldValue; },
        };
        Object.defineProperties(data, {
          default: {
            get(): FieldValue {
              if (formula.target === FormulaTargets.Value) {
                return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settings);
              }
              if (formula.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = formula.target.substring(SettingsFormulaPrefix.length);
                return (settings as Record<string, any>)[settingName];
              }
            },
          },
          initial: {
            get(): FieldValue {
              if (formula.target !== FormulaTargets.Value) { return; }
              return initialFormValues[formula.fieldName];
            },
          },
          prefill: {
            get(): FieldValue {
              if (formula.target !== FormulaTargets.Value) { return; }
              return InputFieldHelpers.parseDefaultValue(formula.fieldName, inputType, settings, itemHeader, true);
            },
          },
          value: {
            get(): FieldValue {
              if (formula.target === FormulaTargets.Value) {
                return formValues[formula.fieldName];
              }
              if (formula.target.startsWith(SettingsFormulaPrefix)) {
                const settingName = formula.target.substring(SettingsFormulaPrefix.length);
                return (previousSettings as Record<string, any>)[settingName];
              }
            },
          },
        });
        const propsV1: FormulaPropsV1 = {
          data,
          context: {
            cache: formula.cache,
            culture: {
              code: currentLanguage,
              name: languages.find(l => l.key === currentLanguage)?.name,
            },
            debug: debugEnabled,
            target: {
              entity: {
                guid: formula.entityGuid,
                id: entityId,
              },
              name: formula.target === FormulaTargets.Value
                ? formula.fieldName
                : formula.target.substring(formula.target.lastIndexOf('.') + 1),
              type: formula.target === FormulaTargets.Value
                ? formula.target
                : formula.target.substring(0, formula.target.lastIndexOf('.')),
            },
          },
          experimental: {
            getEntities(): FormulaV1ExperimentalEntity[] {
              const v1Entities = itemService.getItems(eavService.eavConfig.itemGuids).map(item => {
                const v1Entity: FormulaV1ExperimentalEntity = {
                  guid: item.Entity.Guid,
                  id: item.Entity.Id,
                  type: {
                    id: item.Entity.Type.Id,
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
            },
          }
        };
        return propsV1;
      default:
        return;
    }
  }

  static buildDesignerSnippets(formula: FormulaCacheItem, fieldOptions: FieldOption[]): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const valueSnippet: DesignerSnippet = {
          code: 'data.value',
          label: 'data.value',
        };

        const defaultSnippet: DesignerSnippet = {
          code: 'data.default',
          label: 'data.default',
        };

        const prefillSnippet: DesignerSnippet = {
          code: 'data.prefill',
          label: 'data.prefill',
        };

        const fieldSnippets = fieldOptions.map(field => {
          const code = `data.${field.fieldName}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });

        return [valueSnippet, defaultSnippet, prefillSnippet, ...fieldSnippets];
      default:
        return;
    }
  }
}
