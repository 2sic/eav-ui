import { FieldSettings } from '../../../../../../edit-types';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputTypeSpecs } from '../../state/fields-configs.model';
import { EmptyFieldHelpers } from '../basic/empty-field-helpers';
import { Wrapper, WrappersCatalog } from './wrappers.constants';

const logThis = false;

export class WrapperHelper {

  static getWrappers(settings: FieldSettings, inputTypeSpecs: InputTypeSpecs): Wrapper[] {
    const inputType = inputTypeSpecs.inputType;

    if (EmptyFieldHelpers.isMessage(inputType))
      return [];

    // empty input type wrappers
    if (EmptyFieldHelpers.isGroupStart(inputType))
      return [WrappersCatalog.CollapsibleWrapper];

    // default wrappers
    const wrappers: Wrapper[] = [WrappersCatalog.HiddenWrapper];

    // entity-default/string-dropdown wrappers
    const inputsEntityOrStringDropdown: string[] = [
      InputTypeConstants.EntityDefault,
      InputTypeConstants.StringDropdownQuery,
      InputTypeConstants.EntityQuery,
      InputTypeConstants.EntityContentBlocks,
      InputTypeConstants.StringDropdown,
      InputTypeConstants.EntityPicker,
      InputTypeConstants.StringPicker,
      // || (inputType === InputTypeConstants.WIPNumberPicker);
    ];
    const isEntityOrStringDropdownType = inputsEntityOrStringDropdown.includes(inputType);

    if (isEntityOrStringDropdownType) {
      wrappers.push(WrappersCatalog.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks)
        wrappers.push(WrappersCatalog.PickerExpandableWrapper);
    }

    // External components should always get these wrappers
    if (inputTypeSpecs.isExternal)
      wrappers.push(
        WrappersCatalog.DropzoneWrapper,
        WrappersCatalog.LocalizationWrapper,
        WrappersCatalog.ExpandableWrapper,
        WrappersCatalog.AdamWrapper,
      );

    return wrappers;
  }

}
