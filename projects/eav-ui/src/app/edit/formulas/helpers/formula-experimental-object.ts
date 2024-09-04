import { FormulaV1ExperimentalEntity } from '../models/formula-run-experimental.model';
import { FormulaV1Experimental } from '../models/formula-run-experimental.model';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';
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
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
  }
  getEntities(): FormulaV1ExperimentalEntity[] {
    const { itemService, formConfig } = this.#propsData;
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
    return this.#propsData.fieldsSettingsService.getFieldSettings(fieldName);
  }

  getValues(entityGuid: string): ItemValuesOfLanguage {
    const { language, itemService } = this.#propsData;
    const item = itemService.get(entityGuid);
    const values: ItemValuesOfLanguage = {};
    for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes)) {
      values[fieldName] = LocalizationHelpers.translate(language, fieldValues, null);
    }
    return values;
  }
}