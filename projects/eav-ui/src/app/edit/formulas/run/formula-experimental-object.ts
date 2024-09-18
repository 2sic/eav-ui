import { FormulaV1ExperimentalEntity } from './formula-run-experimental.model';
import { FormulaV1Experimental } from './formula-run-experimental.model';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { EntityReader } from '../../shared/helpers';

/**
 * The object containing experimental information which can change at any time.
 * Usually given to a formula on the third parameter, but not officially documented.
 * eg v2((data, ctx, experimental) => { ... })
 */
export class FormulaExperimentalObject implements FormulaV1Experimental {

  /** Private variable containing the data used in the getters */
  #specs: FormulaExecutionSpecsWithRunParams;

  constructor(propsData: FormulaExecutionSpecsWithRunParams) {
    this.#specs = propsData;
  }

  getEntities(): FormulaV1ExperimentalEntity[] {
    const v1Entities = this.#specs.itemService.getMany(this.#specs.formConfig.config.itemGuids).map(i => ({
      guid: i.Entity.Guid,
      id: i.Entity.Id,
      type: {
        id: i.Entity.Type.Id, // TODO: deprecate again, once we know it's not in use #cleanFormulaType
        guid: i.Entity.Type.Id,
        name: i.Entity.Type.Name,
      }
    } satisfies FormulaV1ExperimentalEntity));
    return v1Entities;
  }

  getSettings(fieldName: string): FieldSettings {
    return this.#specs.fieldsSettingsSvc.settings[fieldName]();
  }

  getValues(entityGuid: string): ItemValuesOfLanguage {
    const item = this.#specs.itemService.get(entityGuid);
    const reader = new EntityReader(this.#specs.language);
    return reader.currentValues(item.Entity.Attributes);
  }
}