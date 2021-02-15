import { take } from 'rxjs/operators';
import { FieldSettings, InputTypeName } from '../../../edit-types';
import { DataTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { InputType } from '../../../ng-dialogs/src/app/content-type-fields/models/input-type.model';
import { WrappersConstants } from '../constants/wrappers.constants';
import { CalculatedInputType } from '../models';
import { EavContentTypeAttribute, EavHeader, EavItem } from '../models/eav';
import { InputTypeService } from '../store/ngrx-data/input-type.service';

export class InputFieldHelper {

  static getContentTypeId(item: EavItem): string {
    return item.Entity.Type ? item.Entity.Type.Id : item.Header.ContentTypeName;
  }

  static getFieldLabel(attribute: EavContentTypeAttribute, settingsTranslated: FieldSettings): string {
    return settingsTranslated && settingsTranslated.Name || attribute.Name;
  }

  static calculateInputTypes(attributes: EavContentTypeAttribute[], inputTypeService: InputTypeService): InputTypeName[] {
    const typesList: InputTypeName[] = [];
    attributes.forEach(attribute => {
      const calculatedInputType = this.calculateInputType(attribute, inputTypeService);
      typesList.push({ name: attribute.Name, inputType: calculatedInputType.inputType });
    });
    return typesList;
  }

  static calculateInputType(attribute: EavContentTypeAttribute, inputTypeService: InputTypeService): CalculatedInputType {
    const inputTypeName = attribute.InputType;
    let inputType: InputType;
    inputTypeService.getInputTypeById(inputTypeName).pipe(take(1)).subscribe(type => {
      inputType = type;
    });
    return {
      inputType: inputTypeName,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
  }

  static calculateInputType2(attribute: EavContentTypeAttribute, inputTypes: InputType[]): CalculatedInputType {
    const inputType = inputTypes.find(i => i.Type === attribute.InputType);
    const calculated: CalculatedInputType = {
      inputType: attribute.InputType,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
    return calculated;
  }

  static setWrappers(calculatedInputType: CalculatedInputType, settingsTranslated: FieldSettings, inputTypeSettings: InputType) {
    // empty inputtype wrappers
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    const isEmptyInputType = (inputType === InputTypeConstants.EmptyDefault)
      || (inputType === DataTypeConstants.Empty);
    if (isEmptyInputType) {
      return [WrappersConstants.CollapsibleWrapper];
    }
    // default wrappers
    const wrappers: string[] = [WrappersConstants.HiddenWrapper];
    // entity-default wrappers
    const isEntityType = (inputType === InputTypeConstants.EntityDefault)
      || (inputType === InputTypeConstants.StringDropdownQuery)
      || (inputType === InputTypeConstants.EntityQuery)
      || (inputType === InputTypeConstants.EntityContentBlocks);

    if (isEntityType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      const allowMultiValue = settingsTranslated.AllowMultiValue || false;
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

  static setWrappers2(settings: FieldSettings, calculatedInputType: CalculatedInputType) {
    const type = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    // empty inputtype wrappers
    if (type === InputTypeConstants.EmptyDefault) { return [WrappersConstants.CollapsibleWrapper]; }

    // default wrappers
    const wrappers = [WrappersConstants.HiddenWrapper];

    // entity-default wrappers
    const isEntityType = (type === InputTypeConstants.EntityDefault)
      || (type === InputTypeConstants.StringDropdownQuery)
      || (type === InputTypeConstants.EntityQuery)
      || (type === InputTypeConstants.EntityContentBlocks);

    if (isEntityType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      const allowMultiValue = settings.AllowMultiValue ?? false;
      if (type === InputTypeConstants.EntityContentBlocks) {
        wrappers.push(WrappersConstants.CollapsibleFieldWrapper);
      }
      if (allowMultiValue || type === InputTypeConstants.EntityContentBlocks) {
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
