import { calculateDropdownOptions } from './string-picker.helpers';
import { PickerConfigs } from '../../picker/constants/picker-config-model.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { EavEntity } from '../../../shared/models/eav';
import { InputTypeCatalog, InputTypeStrict } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings, PickerDataSourceType, UiPickerSourceCustomCsv, UiPickerSourceCustomList } from '../../../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../../../shared/logging';
import { DataSourceParserCsv } from '../../picker/data-sources/data-source-parser-csv';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeCatalog.StringPicker;

  constructor() { super({StringPickerLogic}); }

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    
    var log = classLog({StringPickerLogic});

    const { value, tools } = specs;
    const l = log.fn('update', { specs });

    let dataSources: EavEntity[] = [];
    const entityPickerLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityPicker);
    const fs = entityPickerLogic.update(specs);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getMany(fs.DataSources);

    /** Dropdown data source aka custom-list picker */
    const typeName = dataSources[0]?.Type.Name;
    if ([PickerConfigs.UiPickerSourceCustomList, PickerConfigs.UiPickerSourceCustomCsv].includes(typeName as any)) {
      l.a(`type: ${typeName}`, { dataSource0: dataSources[0] })

      fs.DataSourceType = typeName as PickerDataSourceType;
      const config = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceCustomList | UiPickerSourceCustomCsv;
      fs.ItemInformation = config.ItemInformation ?? '';
      fs.ItemTooltip = config.ItemTooltip ?? '';
      fs.ItemLink = config.ItemLink ?? '';

      fs.EnableEdit = false;
      fs.EnableCreate = false;
      fs.EnableDelete = false;

      if (typeName === PickerConfigs.UiPickerSourceCustomList) {
        fs.DropdownValuesFormat = 'value-label'; //this is the only format supported by the new picker config
        fs.DropdownValues = (config as UiPickerSourceCustomList).Values ?? '';
        fs._options = calculateDropdownOptions(value, 'string', fs.DropdownValuesFormat, fs.DropdownValues) ?? [];
      } else if (typeName === PickerConfigs.UiPickerSourceCustomCsv) {
        console.warn('2dm - new CSV');
        const csv = (config as UiPickerSourceCustomCsv).Csv;
        new DataSourceParserCsv().parse(csv);
      }
    } else
      l.a('type: not UiPickerSourceCustom-List/Csv', { dataSource0: dataSources[0] });

    return l.r(fs);
  }
}

FieldLogicBase.add(StringPickerLogic);
