import { FieldSettings } from 'projects/edit-types';
import { FormValues } from '../../shared/models';
import { FormulaV1Experimental, FormulaV1ExperimentalEntity } from '../models/formula.models';
import { FormulaObjectsInternalData } from './formula-objects-internal-data';
import { LocalizationHelpers } from '../../shared/helpers/localization.helpers';

export class FormulaExperimentalObject implements FormulaV1Experimental {

  /** Private variable containing the data used in the getters */
  #propsData: FormulaObjectsInternalData;

  constructor(propsData: FormulaObjectsInternalData) {
    this.#propsData = propsData;
  }
  getEntities(): FormulaV1ExperimentalEntity[] {
    const { itemService, formConfig } = this.#propsData;
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
  }

  getSettings(fieldName: string): FieldSettings {
    return this.#propsData.fieldsSettingsService.getFieldSettings(fieldName);
  }

  getValues(entityGuid: string): FormValues {
    const { language, itemService } = this.#propsData;
    const item = itemService.getItem(entityGuid);
    const values: FormValues = {};
    for (const [fieldName, fieldValues] of Object.entries(item.Entity.Attributes)) {
      values[fieldName] = LocalizationHelpers.translate(language, fieldValues, null);
    }
    return values;
  }
}