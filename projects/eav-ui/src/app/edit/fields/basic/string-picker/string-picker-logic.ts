import { calculateDropdownOptions } from './string-picker.helpers';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { FieldLogicBase, FieldLogicUpdate } from '../../logic/field-logic-base';
import { FieldLogicManager } from '../../logic/field-logic-manager';
import { EavEntity } from '../../../shared/models/eav';
import { InputTypeConstants, InputTypeStrict } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldSettings, UiPickerSourceCustomList } from '../../../../../../../edit-types/src/FieldSettings';
import { EavLogger } from '../../../../shared/logging/eav-logger';

const logThis = false;

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.StringPicker;

  update(specs: FieldLogicUpdate<string>): FieldSettings {
    const { value, tools } = specs;
    var log = new EavLogger('StringPickerLogic', logThis);
    log.a('update', { specs });

    let dataSources: EavEntity[] = [];
    const entityPickerLogic = FieldLogicManager.singleton().get(InputTypeConstants.EntityPicker);
    const fs = entityPickerLogic.update(specs);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

    /** Dropdown data source aka custom-list picker */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceCustomList) {
      log.a('type: UiPickerSourceCustomList', { dataSource0: dataSources[0] })
      fs.DataSourceType = PickerConfigModels.UiPickerSourceCustomList;
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