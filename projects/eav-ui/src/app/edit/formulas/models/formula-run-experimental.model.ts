import { FieldSettings } from 'projects/edit-types';
import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';


export interface FormulaV1Experimental {
  getEntities(): FormulaV1ExperimentalEntity[];
  /**
   * This gets FIELD settings.
   * TODO: @2dm Must find out if it's used anywhere, and probably rename to getFieldSettings
   */
  getSettings(fieldName: string): FieldSettings;
  getValues(entityGuid: string): ItemValuesOfLanguage;
}

// TODO: once the id is gone, merge with the type FormulaV1CtxTargetEntityType
export interface FormulaV1ExperimentalEntity {
  guid: string;
  id: number;
  type: {
    id: string; // TODO: deprecate again, once we know it's not in use #cleanFormulaType
    name: string;
    guid: string;
  };
}

