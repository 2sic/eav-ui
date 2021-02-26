import { FieldSettings, InputTypeName } from '../../../edit-types';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { WrappersConstants } from '../constants/wrappers.constants';
import { CalculatedInputType } from '../models';
import { EavContentTypeAttribute, EavHeader, EavItem } from '../models/eav';

export class InputFieldHelper {

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

    // empty inputtype wrappers
    if (inputType === InputTypeConstants.EmptyDefault) { return [WrappersConstants.CollapsibleWrapper]; }

    // default wrappers
    const wrappers = [WrappersConstants.HiddenWrapper];

    // entity-default wrappers
    const isEntityType = (inputType === InputTypeConstants.EntityDefault)
      || (inputType === InputTypeConstants.StringDropdownQuery)
      || (inputType === InputTypeConstants.EntityQuery)
      || (inputType === InputTypeConstants.EntityContentBlocks);

    if (isEntityType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (inputType === InputTypeConstants.EntityContentBlocks) {
        wrappers.push(WrappersConstants.CollapsibleFieldWrapper);
      }
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks) {
        wrappers.push(WrappersConstants.EntityExpandableWrapper);
      }
    }

    if (isExternal) {
      wrappers.push(
        WrappersConstants.DropzoneWrapper,
        WrappersConstants.LocalizationWrapper,
        WrappersConstants.ExpandableWrapper,
        WrappersConstants.AdamAttachWrapper,
      );
    }

    return wrappers;
  }

  static parseDefaultValue(attributeKey: string, inputType: string, settings: FieldSettings, header: EavHeader): any {
    let defaultValue = settings.DefaultValue;

    if (header.Prefill && header.Prefill[attributeKey]) {
      defaultValue = header.Prefill[attributeKey];
    }

    switch (inputType) {
      case InputTypeConstants.BooleanDefault:
        return defaultValue != null
          ? defaultValue.toLowerCase() === 'true'
          : false;
      case InputTypeConstants.DatetimeDefault:
        return defaultValue != null && defaultValue !== ''
          ? new Date(defaultValue)
          : null;
      case InputTypeConstants.NumberDefault:
        return defaultValue != null && defaultValue !== ''
          ? Number(defaultValue)
          : '';
      case InputTypeConstants.EntityDefault:
      case InputTypeConstants.EntityQuery:
      case InputTypeConstants.EntityContentBlocks:
        if (!(defaultValue != null && defaultValue !== '')) {
          return []; // no default value
        }
        // 3 possibilities
        if (defaultValue.constructor === Array) { return defaultValue; }  // possibility 1) an array
        // for possibility 2 & 3, do some variation checking
        if (defaultValue.indexOf('{') > -1) { // string has { } characters, we must switch them to quotes
          defaultValue = defaultValue.replace(/[\{\}]/g, '\"');
        }
        if (defaultValue.indexOf(',') !== -1 && defaultValue.indexOf('[') === -1) { // list but no array, add brackets
          const guids = defaultValue.split(',').map(guid => guid.trim());
          defaultValue = JSON.stringify(guids);
        }
        return (defaultValue.indexOf('[') === 0) // possibility 2) an array with guid strings
          ? JSON.parse(defaultValue) // if it's a string containing an array
          : [defaultValue.replace(/"/g, '')]; //  possibility 3) just a guid string, but might have quotes
      default:
        return defaultValue ? defaultValue : '';
    }
  }
}
