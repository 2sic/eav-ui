import { Of } from 'projects/eav-ui/src/app/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog, InputTypeStrict } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerSourcesCustom } from '../../picker/constants/picker-config-model.constants';
import { PickerLogicShared } from '../../picker/picker-logic-shared';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeCatalog.StringPicker;

  constructor() { super({StringPickerLogic}); }

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    
    var log = classLog({StringPickerLogic}, null, true);

    const l = log.fn('update', { specs });

    const { fs, overriding, typeConfig } = new PickerLogicShared().preUpdate(specs);

    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    /** Dropdown data source aka custom-list picker */
    const typeName = fs.DataSourceType;
    const isCustomSource = Object.values(PickerSourcesCustom).includes(typeName as Of<typeof PickerSourcesCustom>);
    l.a(`type: ${typeName}`, { typeConfig, isCustomSource });

    if (isCustomSource) {
      if (!overriding) {
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
