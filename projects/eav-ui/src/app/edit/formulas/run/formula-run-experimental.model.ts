import { ItemValuesOfLanguage } from '../../state/item-values-of-language.model';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';


export interface FormulaV1Experimental {
  getEntities(): FormulaContextEntityInfo[];
  /**
   * This gets FIELD settings.
   * TODO: @2dm Must find out if it's used anywhere, and probably rename to getFieldSettings
   */
  getSettings(fieldName: string): FieldSettings;
  getValues(entityGuid: string): ItemValuesOfLanguage;
}

// TODO: once the id is gone, merge with the type FormulaV1CtxTargetEntityType
export interface FormulaContextEntityInfo {
  guid: string;
  id: number;
  type: {
    name: string;
    guid: string;
  };
}

