import { FieldSettings, UiPickerSourceCustomList } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavEntity } from '../../../../shared/models/eav';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { calculateDropdownOptions } from './string-picker.helpers';

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.WIPStringPicker;

  update(settings: FieldSettings, value: string, tools: FieldLogicTools): FieldSettings {
    let dataSources: EavEntity[] = [];
    const entityPickerLogic = FieldLogicManager.singleton().get(InputTypeConstants.WIPEntityPicker);
    const fs = entityPickerLogic.update(settings, value, tools);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

    /** Dropdown datasource */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceCustomList) {
      fs.DataSourceType = PickerConfigModels.UiPickerSourceCustomList;
      const uiPickerSourceCustomList = tools.entityReader.flatten(dataSources[0]) as UiPickerSourceCustomList;

      fs.DropdownValuesFormat = 'value-label'; //this is the only format supported by the new picker config
      fs.DropdownValues = uiPickerSourceCustomList.Values ?? '';
      fs._options = calculateDropdownOptions(value, 'string', fs.DropdownValuesFormat, fs.DropdownValues) ?? [];

      fs.Information = uiPickerSourceCustomList.ItemInformation ?? '';
      fs.Tooltip = uiPickerSourceCustomList.ItemTooltip ?? '';
      fs.HelpLink = uiPickerSourceCustomList.ItemHelpLink ?? '';
    }

    return fs;
  }
}

FieldLogicBase.add(StringPickerLogic);
