import { FieldSettings } from '../../../../../edit-types';
import { EntityDefaultLogic } from '../../entity/entity-default/entity-default-logic';

export class StringDropdownQueryLogic extends EntityDefaultLogic {
  constructor() {
    super();
  }

  init(settings: FieldSettings): FieldSettings {
    const fixedSettings = super.init(settings);
    if (fixedSettings.Value == null) { fixedSettings.Value = ''; }
    if (fixedSettings.Label == null) { fixedSettings.Label = ''; }
    if (fixedSettings.EnableTextEntry == null) { fixedSettings.EnableTextEntry = false; }
    if (fixedSettings.Separator == null || fixedSettings.Separator === '') { fixedSettings.Separator = ','; }
    return fixedSettings;
  }
}
