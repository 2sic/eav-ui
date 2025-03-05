import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { EntityReader } from '../../shared/helpers';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FormulaExecutionSpecsWithRunParams } from './formula-objects-internal-data';
import { FormulaContextEntityInfo, FormulaV1Experimental } from './formula-run-experimental.model';

const messageObsolete = 'A formula in this dialog is using an experimental feature: "{0}" - this will be removed soon.';

/**
 * The object containing experimental information which can change at any time.
 * Usually given to a formula on the third parameter, but not officially documented.
 * eg v2((data, ctx, experimental) => { ... })
 */
export class FormulaExperimentalObject implements FormulaV1Experimental {
  #specs: FormulaExecutionSpecsWithRunParams;
  constructor(specs: FormulaExecutionSpecsWithRunParams) { 
    this.#specs = specs; 
  }

  getEntities(): FormulaContextEntityInfo[] {
    this.#showWarningObsolete('getEntities');
    const v1Entities = this.#specs.itemService.getMany(this.#specs.formConfig.config.itemGuids).map(i => ({
      guid: i.Entity.Guid,
      id: i.Entity.Id,
      type: {
        guid: i.Entity.Type.Id,
        name: i.Entity.Type.Name,
      }
    } satisfies FormulaContextEntityInfo));
    return v1Entities;
  }

  getSettings(fieldName: string): FieldSettings {
    this.#showWarningObsolete('getSettings');
    return this.#specs.fieldsSettingsSvc.settings[fieldName]();
  }

  getValues(entityGuid: string): ItemValuesOfLanguage {
    this.#showWarningObsolete('getValues');
    const item = this.#specs.itemService.get(entityGuid);
    const reader = new EntityReader(this.#specs.language);
    return reader.currentValues(item.Entity.Attributes);
  }

  #showWarningObsolete(name: string) {
    const msg = messageObsolete.replace('{0}', name);
    console.error(msg);

    if (this.#specs.warningsObsolete[name])
      return;
    this.#specs.warningsObsolete[name] = true;
    alert(msg);
  }
}