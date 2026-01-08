import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldSettingsSharedSeparator } from '../../../../../../../edit-types/src/FieldSettings-Pickers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsHelpersManager } from '../../logic/field-settings-helpers-manager';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { EntityDefaultLogic } from '../entity-default/entity-default-settings-helper';

export class StringDropdownQueryLogic extends FieldSettingsHelperBase {
  name = InputTypeCatalog.StringDropdownQuery;

  constructor() { super({ StringDropdownQueryLogic }); }

  update(specs: FieldSettingsUpdateTask<string[]>): FieldSettings {
    const entityDefaultLogic = FieldSettingsHelpersManager.singleton().get(InputTypeCatalog.EntityDefault) as EntityDefaultLogic;
    const fs = entityDefaultLogic.update(specs) as FieldSettings & FieldSettingsSharedSeparator;
    fs.Separator ||= ',';

    // New features should not be supported in this old input, so commented out
    // fixedSettings.Value ??= '';
    // fixedSettings.Label ??= '';
    // fixedSettings.MoreFields ??= '';
    return fs;
  }
}

FieldSettingsHelperBase.add(StringDropdownQueryLogic);
