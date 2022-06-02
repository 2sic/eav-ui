import { FieldSettings, FieldValue, InputTypeName } from '../../../../../../edit-types';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { InputType } from '../../../content-type-fields/models/input-type.model';
import { WrappersConstant, WrappersConstants } from '../constants/wrappers.constants';
import { CalculatedInputType } from '../models';
import { EavContentTypeAttribute, EavHeader, EavItem } from '../models/eav';
import { EavService } from '../services';

export class InputFieldHelpers {

  static getContentTypeId(item: EavItem): string {
    return item.Entity.Type?.Id ?? item.Header.ContentTypeName;
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
      inputType: attribute.InputType,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
    return calculated;
  }

  static getWrappers(settings: FieldSettings, calculatedInputType: CalculatedInputType) {
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    if (inputType === InputTypeConstants.EmptyMessage) { return []; }

    // empty inputtype wrappers
    if (inputType === InputTypeConstants.EmptyDefault) { return [WrappersConstants.CollapsibleWrapper]; }

    // default wrappers
    const wrappers: WrappersConstant[] = [WrappersConstants.HiddenWrapper];

    // entity-default wrappers
    const isEntityType = (inputType === InputTypeConstants.EntityDefault)
      || (inputType === InputTypeConstants.StringDropdownQuery)
      || (inputType === InputTypeConstants.EntityQuery)
      || (inputType === InputTypeConstants.EntityContentBlocks);

    if (isEntityType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks) {
        wrappers.push(WrappersConstants.EntityExpandableWrapper);
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
    attributeKey: string,
    inputType: InputType,
    settings: FieldSettings,
    itemHeader?: EavHeader,
    onlyPrefill?: boolean,
  ): FieldValue {
    if (onlyPrefill && itemHeader?.Prefill?.[attributeKey] === undefined) { return; }

    let defaultValue = settings.DefaultValue;

    if (itemHeader?.Prefill?.[attributeKey]) {
      defaultValue = itemHeader.Prefill[attributeKey];
    }

    switch (inputType?.Type) {
      case InputTypeConstants.BooleanDefault:
        return defaultValue != null
          ? defaultValue.toLowerCase() === 'true'
          : false;
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
        return defaultValue != null && defaultValue !== ''
          ? !isNaN(Number(defaultValue)) ? Number(defaultValue) : null
          : null;
      case InputTypeConstants.EntityDefault:
      case InputTypeConstants.EntityQuery:
      case InputTypeConstants.EntityContentBlocks:
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

  /**
   * Entity fields for empty items are prefilled on the backend with []
   * so I can never know if entity field is brand new, or just emptied out by the user
   */
  static isValueEmpty(value: FieldValue, eavService: EavService) {
    const emptyEntityField = Array.isArray(value) && value.length === 0 && eavService.eavConfig.createMode;
    return value === undefined || emptyEntityField;
  }
}
