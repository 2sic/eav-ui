import { FormulaV1ExperimentalEntity } from './formula-run-experimental.model';
import { FormulaV1Experimental } from './formula-run-experimental.model';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { LocalizationHelpers } from '../../localization/localization.helpers';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';

/**
 * The object containing experimental information which can change at any time.
 * Usually given to a formula on the third parameter, but not officially documented.
 * eg v2((data, ctx, experimental) => { ... })
 */
export class FormulaExperimentalObject implements FormulaV1Experimental {

  /** Private variable containing the data used in the getters */
  #formulaExecSpecs: FormulaExecutionSpecsWithRunParams;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#formulaExecSpecs = propsData;
  }

  getEntities(): FormulaV1ExperimentalEntity[] {
    const { itemService, formConfig } = this.#formulaExecSpecs;
    const v1Entities = itemService.getMany(formConfig.config.itemGuids).map(item => {
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
  }

  getSettings(fieldName: string): FieldSettings {
    return this.#formulaExecSpecs.fieldsSettingsSvc.settings[fieldName]();
  }

  getValues(entityGuid: string): ItemValuesOfLanguage {
    const { language, itemService } = this.#formulaExecSpecs;
    const item = itemService.get(entityGuid);
    const values: ItemValuesOfLanguage = {};
    for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes)) {
      values[fieldName] = LocalizationHelpers.translate(language, fieldValues, null);
    }
    return values;
  }
}