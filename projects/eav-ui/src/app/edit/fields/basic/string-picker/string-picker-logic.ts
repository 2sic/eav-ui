import { Of } from '../../../../../../../core/type-utilities';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerSourcesCustom } from '../../picker/constants/picker-config-model.constants';
import { PickerLogicShared } from '../../picker/picker-logic-shared';

export class StringPickerLogic extends FieldLogicBase {
  name: Of<typeof InputTypeCatalog> = InputTypeCatalog.StringPicker;

  constructor() { super({StringPickerLogic}); }

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    
    var log = classLog({StringPickerLogic}, null);

    const l = log.fn('update', { specs });

    const { fs, removeEditRestrictions, typeConfig } = new PickerLogicShared().preUpdate(specs);

    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    /** Dropdown data source aka custom-list picker */
    const typeName = fs.DataSourceType;
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

FieldLogicBase.add(StringPickerLogic);
