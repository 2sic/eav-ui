import { FieldSettings, FieldValue, InputTypeName } from '../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { ItemAddIdentifier, ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../form/fields/empty/empty-field-helpers';
import { WrappersConstant, WrappersConstants } from '../constants/wrappers.constants';
import { CalculatedInputType } from '../models';
import { EavContentTypeAttribute, EavItem } from '../models/eav';

export class InputFieldHelpers {

  static getContentTypeId(item: EavItem): string {
    return item.Entity.Type?.Id ?? (item.Header as ItemAddIdentifier).ContentTypeName;
  }

  static getInputTypeNames(attributes: EavContentTypeAttribute[], inputTypes: InputType[]): InputTypeName[] {
    return attributes.map(attribute => {
      const calculatedInputType = this.calculateInputType(attribute, inputTypes);
      const inputTypeName: InputTypeName = {
        name: attribute.Name,
        inputType: calculatedInputType.inputType,
      };
      return inputTypeName;
    });
  }

  static calculateInputType(attribute: EavContentTypeAttribute, inputTypes: InputType[]): CalculatedInputType {
    const inputType = inputTypes.find(i => i.Type === attribute.InputType);
    const calculated: CalculatedInputType = {
      inputType: attribute.InputType as InputTypeStrict,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
    return calculated;
  }

  static getWrappers(settings: FieldSettings, calculatedInputType: CalculatedInputType) {
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    if (EmptyFieldHelpers.isMessage(inputType)) return [];

    // empty input type wrappers
    if (EmptyFieldHelpers.isGroupStart(inputType)) return [WrappersConstants.CollapsibleWrapper];

    // default wrappers
    const wrappers: WrappersConstant[] = [WrappersConstants.HiddenWrapper];

    // entity-default/string-dropdown wrappers
    const isEntityOrStringDropdownType = (inputType === InputTypeConstants.EntityDefault)
      || (inputType === InputTypeConstants.StringDropdownQuery)
      || (inputType === InputTypeConstants.EntityQuery)
      || (inputType === InputTypeConstants.EntityContentBlocks)
      || (inputType === InputTypeConstants.StringDropdown)
      /** WIP pickers */
      || (inputType === InputTypeConstants.WIPEntityPicker)
      || (inputType === InputTypeConstants.WIPStringPicker);
      // || (inputType === InputTypeConstants.WIPNumberPicker);
    
    const allowMultiValue = settings.AllowMultiValue ?? false;

    if (isEntityOrStringDropdownType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks) {
        wrappers.push(WrappersConstants.PickerExpandableWrapper);
      }
    }

    if (isExternal) {
      wrappers.push(
        WrappersConstants.DropzoneWrapper,
        WrappersConstants.LocalizationWrapper,
        WrappersConstants.ExpandableWrapper,
        WrappersConstants.AdamWrapper,
      );
    }

    return wrappers;
  }

  /** Include itemHeader if you need data from prefill, and set onlyPrefill if you only need parsed prefill */
  static parseDefaultValue(
    name: string,
    inputType: InputTypeStrict,
    settings: FieldSettings,
    itemHeader?: ItemIdentifierShared,
    onlyPrefill?: boolean,
  ): FieldValue {
    if (onlyPrefill && itemHeader?.Prefill?.[name] === undefined) { return; }

    let defaultValue = itemHeader?.Prefill?.[name]?.toString() ?? settings.DefaultValue;

    switch (inputType) {
      case InputTypeConstants.BooleanDefault:
        return defaultValue?.toLowerCase() === 'true';
      case InputTypeConstants.BooleanTristate:
        return defaultValue != null && defaultValue !== ''
          ? defaultValue.toLowerCase() === 'true'
          : null;
      case InputTypeConstants.DatetimeDefault:
        return defaultValue != null && defaultValue !== ''
          ? new Date(defaultValue).toJSON()
          : null;
      case InputTypeConstants.NumberDefault:
      case InputTypeConstants.NumberDropdown:
      case InputTypeConstants.WIPNumberPicker:
        return defaultValue != null && defaultValue !== ''
          ? !isNaN(Number(defaultValue)) ? Number(defaultValue) : null
          : null;
      case InputTypeConstants.EntityDefault:
      case InputTypeConstants.EntityQuery:
      case InputTypeConstants.EntityContentBlocks:
      case InputTypeConstants.WIPEntityPicker:
        if (defaultValue == null || defaultValue === '') { return []; }
        // string has { } characters, we must switch them to quotes
        if (defaultValue.includes('{')) {
          defaultValue = defaultValue.replace(/[\{\}]/g, '\"');
        }
        // list but no array, add brackets
        if (defaultValue.includes(',') && !defaultValue.includes('[')) {
          const guids = defaultValue.split(',').map(guid => guid.trim());
          defaultValue = JSON.stringify(guids);
        }
        return defaultValue.startsWith('[') // an array with guid strings
          ? JSON.parse(defaultValue) // if it's a string containing an array
          : [defaultValue.replace(/"/g, '')]; // just a guid string, but might have quotes
      default:
        return defaultValue ?? '';
    }
  }

  // 2023-08-31 2dm moved to logic...
  // /**
  //  * Entity fields for empty items are prefilled on the backend with []
  //  * so I can never know if entity field is brand new, or just emptied out by the user
  //  */
  // static isValueEmpty(value: FieldValue, eavService: EavService) {
  //   const emptyEntityField = Array.isArray(value) && value.length === 0 && eavService.eavConfig.createMode;
  //   return value === undefined || emptyEntityField;
  // }
}
