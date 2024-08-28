import { FieldSettings } from '../../../../../../edit-types';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeSpecs } from '../../state/fields-configs.model';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { Wrapper, WrappersCatalog } from './wrappers.constants';

const logThis = false;

export class WrapperHelper {

  static getWrappers(settings: FieldSettings, inputTypeSpecs: InputTypeSpecs): Wrapper[] {
    const inputType = inputTypeSpecs.inputType;

    if (InputTypeHelpers.isMessage(inputType))
      return [];

    // empty input type wrappers
    if (InputTypeHelpers.isGroupStart(inputType))
      return [WrappersCatalog.CollapsibleWrapper];

    // default wrappers
    const wrappers: Wrapper[] = [WrappersCatalog.HiddenWrapper];

    // entity-default/string-dropdown wrappers
    const inputsEntityOrStringDropdown: string[] = [
      InputTypeCatalog.EntityDefault,
      InputTypeCatalog.StringDropdownQuery,
      InputTypeCatalog.EntityQuery,
      InputTypeCatalog.EntityContentBlocks,
      InputTypeCatalog.StringDropdown,
      InputTypeCatalog.EntityPicker,
      InputTypeCatalog.StringPicker,
      // || (inputType === InputTypeConstants.WIPNumberPicker);
    ];
    const isEntityOrStringDropdownType = inputsEntityOrStringDropdown.includes(inputType);

    if (isEntityOrStringDropdownType) {
      wrappers.push(WrappersCatalog.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (allowMultiValue || inputType === InputTypeCatalog.EntityContentBlocks)
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
