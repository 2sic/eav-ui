import { calculateDropdownOptions } from './string-picker.helpers';
import { PickerConfigs } from '../../picker/constants/picker-config-model.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { EavEntity } from '../../../shared/models/eav';
import { InputTypeCatalog, InputTypeStrict } from '../../../../shared/fields/input-type-catalog';
import { FieldSettings, UiPickerSourceCustomList } from '../../../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../../../shared/logging';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeCatalog.StringPicker;

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    
    var log = classLog({StringPickerLogic});

    const { value, tools } = specs;
    log.a('update', { specs });

    let dataSources: EavEntity[] = [];
    const entityPickerLogic = FieldLogicManager.singleton().get(InputTypeCatalog.EntityPicker);
    const fs = entityPickerLogic.update(specs);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getMany(fs.DataSources);

    /** Dropdown data source aka custom-list picker */
    if (dataSources[0]?.Type.Name === PickerConfigs.UiPickerSourceCustomList) {
      log.a('type: UiPickerSourceCustomList', { dataSource0: dataSources[0] })
      fs.DataSourceType = PickerConfigs.UiPickerSourceCustomList;
      const uiPickerSourceCustomList = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceCustomList;

      fs.DropdownValuesFormat = 'value-label'; //this is the only format supported by the new picker config
      fs.DropdownValues = uiPickerSourceCustomList.Values ?? '';
      fs._options = calculateDropdownOptions(value, 'string', fs.DropdownValuesFormat, fs.DropdownValues) ?? [];

      fs.ItemInformation = uiPickerSourceCustomList.ItemInformation ?? '';
      fs.ItemTooltip = uiPickerSourceCustomList.ItemTooltip ?? '';
      fs.ItemLink = uiPickerSourceCustomList.ItemLink ?? '';

      fs.EnableEdit = false;
      fs.EnableCreate = false;
      fs.EnableDelete = false;
    } else
      log.a('type: not UiPickerSourceCustomList', { dataSource0: dataSources[0] });

    return fs;
  }
}

FieldLogicBase.add(StringPickerLogic);
