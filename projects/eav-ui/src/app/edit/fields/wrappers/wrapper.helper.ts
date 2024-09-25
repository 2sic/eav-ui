import { FieldSettings } from '../../../../../../edit-types';
import { Of } from '../../../core';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { InputTypeSpecs } from '../../shared/input-types/input-type-specs.model';
import { WrappersCatalog } from './wrappers.constants';

const logThis = false;

export class WrapperHelper {

  static getWrappers(settings: FieldSettings, inputTypeSpecs: InputTypeSpecs): Of<typeof WrappersCatalog>[] {
    const inputType = inputTypeSpecs.inputType;

    if (InputTypeHelpers.isMessage(inputType))
      return [];

    // Empty input type wrappers - in this case, exit early
    if (InputTypeHelpers.isGroupStart(inputType))
      return [WrappersCatalog.CollapsibleWrapper];

    // Start with default wrappers for all controls
    const wrappers: Of<typeof WrappersCatalog>[] = [
      WrappersCatalog.HiddenWrapper
    ];

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
      // New ...
      wrappers.push(WrappersCatalog.FeatureWarningWrapper);
      // i18n
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
