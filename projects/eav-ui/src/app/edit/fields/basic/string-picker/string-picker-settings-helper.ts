import { Of } from '../../../../../../../core/type-utilities';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldSettingsHelperBase } from '../../logic/field-settings-helper-base';
import { FieldSettingsUpdateTask } from '../../logic/field-settings-update-task';
import { PickerSourcesCustom } from '../../picker/constants/picker-config-model.constants';
import { PickerLogicShared } from '../../picker/picker-settings-helper-shared';

export class StringPickerSettingsHelper extends FieldSettingsHelperBase {
  name: Of<typeof InputTypeCatalog> = InputTypeCatalog.StringPicker;

  constructor() { super({StringPickerSettingsHelper}); }

  update(specs: FieldSettingsUpdateTask<string>): FieldSettings {
    
    var log = classLog({StringPickerSettingsHelper}, null);
    const l = log.fn('update', { specs });

    const { fs, removeEditRestrictions, typeConfig } = new PickerLogicShared().preUpdate(specs);

    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    /** Dropdown data source aka custom-list picker */
    const typeName = fs.dataSourceType;
    const isCustomSource = Object.values(PickerSourcesCustom).includes(typeName as Of<typeof PickerSourcesCustom>);
    l.a(`type: ${typeName}`, { typeConfig, isCustomSource });

    if (isCustomSource) {
      if (!removeEditRestrictions) {
        fs.EnableEdit = false;
        fs.EnableCreate = false;
        fs.EnableDelete = false;
      }
    } else
      l.a('type: not UiPickerSourceCustom-List/Csv', { typeConfig });

    return l.r(fs);
  }
}

FieldSettingsHelperBase.add(StringPickerSettingsHelper);
