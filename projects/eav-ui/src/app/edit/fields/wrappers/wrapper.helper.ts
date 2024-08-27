import { FieldSettings } from '../../../../../../edit-types';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputTypeSpecs } from '../../state/fields-configs.model';
import { EmptyFieldHelpers } from '../basic/empty-field-helpers';
import { WrappersConstant, WrappersConstants } from './wrappers.constants';

const logThis = false;

export class WrapperHelper {

  static getWrappers(settings: FieldSettings, calculatedInputType: InputTypeSpecs) {
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    if (EmptyFieldHelpers.isMessage(inputType))
      return [];

    // empty input type wrappers
    if (EmptyFieldHelpers.isGroupStart(inputType))
      return [WrappersConstants.CollapsibleWrapper];

    // default wrappers
    const wrappers: WrappersConstant[] = [WrappersConstants.HiddenWrapper];

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
      wrappers.push(WrappersConstants.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks)
        wrappers.push(WrappersConstants.PickerExpandableWrapper);
    }

    // External components should always get these wrappers
    if (isExternal)
      wrappers.push(
        WrappersConstants.DropzoneWrapper,
        WrappersConstants.LocalizationWrapper,
        WrappersConstants.ExpandableWrapper,
        WrappersConstants.AdamWrapper,
      );

    return wrappers;
  }

}
