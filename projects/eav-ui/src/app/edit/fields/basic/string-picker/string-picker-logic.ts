import { FieldSettings, UiPickerSourceCustomCsv, UiPickerSourceCustomList } from '../../../../../../../edit-types/src/FieldSettings';
import { FeatureNames } from '../../../../features/feature-names';
import { InputTypeCatalog, InputTypeStrict } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { PickerConfigs } from '../../picker/constants/picker-config-model.constants';
import { DataSourceParserCsv } from '../../picker/data-sources/data-source-parser-csv';
import { PickerLogicShared } from '../../picker/picker-logic-shared';
import { calculateDropdownOptions } from './string-picker.helpers';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeCatalog.StringPicker;

  constructor() { super({StringPickerLogic}); }

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    
    var log = classLog({StringPickerLogic}, null, true);

    const l = log.fn('update', { specs });

    const { fs, overriding, dataSourceTypeName: typeName, typeConfig } = new PickerLogicShared().preUpdate(specs);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    /** Dropdown data source aka custom-list picker */
    const isCustomSource = [PickerConfigs.UiPickerSourceCustomList, PickerConfigs.UiPickerSourceCustomCsv].includes(typeName as any);
    if (isCustomSource) {
      l.a(`type: ${typeName}`, { typeConfig })

      if (!overriding) {
        fs.EnableEdit = false;
        fs.EnableCreate = false;
        fs.EnableDelete = false;
      }

      if (typeName === PickerConfigs.UiPickerSourceCustomList) {
        fs.DropdownValues = (typeConfig as unknown as UiPickerSourceCustomList).Values ?? '';
        // note that 'value-label' is the only format supported by the new picker config
        fs._options ??= calculateDropdownOptions(specs.value, 'string', 'value-label', fs.DropdownValues) ?? [];
      } else if (typeName === PickerConfigs.UiPickerSourceCustomCsv) {
        // TODO: THIS should of course also be possible in Entity Pickers
        const csv = (typeConfig as unknown as UiPickerSourceCustomCsv).Csv;
        fs._options ??= new DataSourceParserCsv().parse(csv);
        fs.requiredFeatures = [FeatureNames.PickerSourceCsv];
      }
    } else
      l.a('type: not UiPickerSourceCustom-List/Csv', { typeConfig });

    return l.r(fs);
  }
}

FieldLogicBase.add(StringPickerLogic);
