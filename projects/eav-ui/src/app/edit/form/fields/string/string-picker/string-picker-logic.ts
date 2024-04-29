import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { FieldSettings, UiPickerSourceCustomList } from '../../../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavEntity } from '../../../../shared/models/eav';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicManager } from '../../../shared/field-logic/field-logic-manager';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerConfigModels } from '../../picker/constants/picker-config-model.constants';
import { calculateDropdownOptions } from './string-picker.helpers';

const logThis = true;

export class StringPickerLogic extends FieldLogicBase {
  name: InputTypeStrict = InputTypeConstants.WIPStringPicker;

  update(settings: FieldSettings, value: string, tools: FieldLogicTools): FieldSettings {
    var log = new EavLogger('StringPickerLogic', logThis);
    log.add('update', settings, value, tools);

    let dataSources: EavEntity[] = [];
    const entityPickerLogic = FieldLogicManager.singleton().get(InputTypeConstants.WIPEntityPicker);
    const fs = entityPickerLogic.update(settings, value, tools);

    fs.EnableTextEntry ??= false;
    fs.Separator ??= '\n'; //'\\n';
    if (fs.Separator == '\\n') fs.Separator = '\n'; //buggy temp double-slash-n

    if (fs.DataSources?.length > 0)
      dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);

    /** Dropdown data source aka custom-list picker */
    if (dataSources[0]?.Type.Name === PickerConfigModels.UiPickerSourceCustomList) {
      log.add('type: UiPickerSourceCustomList', dataSources[0])
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
      log.add('type: not UiPickerSourceCustomList', dataSources[0]);

    return fs;
  }
}

FieldLogicBase.add(StringPickerLogic);
