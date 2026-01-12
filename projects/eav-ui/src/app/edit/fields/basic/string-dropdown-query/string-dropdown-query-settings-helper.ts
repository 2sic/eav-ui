import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsSharedSeparator } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { EntityDefaultSettingsHelper } from '../entity-default/entity-default-settings-helper';

export class StringDropdownQuerySettingsHelper extends FieldSettingsHelperBase {
  name = InputTypeCatalog.StringDropdownQuery;

  constructor() { super({ StringDropdownQuerySettingsHelper }); }

  update(specs: FieldSettingsUpdateTask<string[]>): FieldSettings {
    const entityDefaultLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.EntityDefault) as EntityDefaultSettingsHelper;
    const fs = entityDefaultLogic.update(specs) as FieldSettings & FieldSettingsSharedSeparator;
    fs.Separator ||= ',';

    // New features should not be supported in this old input, so commented out
    // fixedSettings.Value ??= '';
    // fixedSettings.Label ??= '';
    // fixedSettings.MoreFields ??= '';
    return fs;
  }
}

FieldSettingsHelperBase.add(StringDropdownQuerySettingsHelper);
