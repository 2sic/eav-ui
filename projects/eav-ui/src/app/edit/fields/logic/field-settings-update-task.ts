import { FieldSettings, FieldValue } from 'projects/edit-types/index-for-documentation';
import { FieldLogicTools } from './field-logic-tools';

/**
 * Update specs and tools to update field settings.
 * Used in the FieldLogic.update method.
 */
export interface FieldSettingsUpdateTask<T = FieldValue> {
  /** The field name, to better debug */
  fieldName: string;

  /** Settings before logic update */
  settings: FieldSettings;

  /** Tools for doing various kind of work in the logic, which is singleton and may need context-specific tools */
  tools: FieldLogicTools;

  /** The field value which the settings-update sometimes needs to know, eg. to indicated selected option in a dropdown */
  value?: T;
}
