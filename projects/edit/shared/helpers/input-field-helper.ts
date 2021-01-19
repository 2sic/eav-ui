import { take } from 'rxjs/operators';
import { FieldSettings, InputTypeName } from '../../../edit-types';
import { DataTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/data-type.constants';
import { InputTypeConstants } from '../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { FieldConfigGroup, FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { WrappersConstants } from '../constants/wrappers.constants';
import { EavHeader, InputType, Item } from '../models/eav';
import { AttributeDef } from '../models/eav/attribute-def';
import { CalculatedInputType } from '../models/input-field-models';
import { InputTypeService } from '../store/ngrx-data/input-type.service';

export class InputFieldHelper {
  /** This is attribute type (not attribute inputType) */
  static getFieldType(config: FieldConfigSet, attributeKey: string): string {
    if (config.field.type) {
      return config.field.type;
    } else {
      const field = config.field as FieldConfigGroup;
      return this.getFieldTypeFromFieldGroup(field.fieldGroup, attributeKey);
    }
  }

  /**
   * Loop through fieldGroup configuration recursively to get type.
   * Form group configuration have configuration from all child fields
   */
  static getFieldTypeFromFieldGroup(fieldGroup: FieldConfigSet[], attributeKey: string) {
    let type;
    fieldGroup.forEach(config => {
      const field = config.field as FieldConfigGroup;
      if (field.fieldGroup) {
        const typeFromFieldGroup = this.getFieldTypeFromFieldGroup(field.fieldGroup, attributeKey);
        if (typeFromFieldGroup) {
          type = typeFromFieldGroup;
        }
      } else {
        if (config.field.name === attributeKey) {
          type = config.field.type;
        }
      }
    });
    return type;
  }

  static getContentTypeId(item: Item): string {
    return item.entity.type ? item.entity.type.id : item.header.ContentTypeName;
  }

  static getFieldLabel(attribute: AttributeDef, settingsTranslated: FieldSettings): string {
    return settingsTranslated && settingsTranslated.Name || attribute.name;
  }

  static calculateInputTypes(attributesList: AttributeDef[], inputTypeService: InputTypeService): InputTypeName[] {
    const typesList: InputTypeName[] = [];
    attributesList.forEach((attribute, index) => {
      const calculatedInputType = this.calculateInputType(attribute, inputTypeService);
      typesList.push({ name: attribute.name, inputType: calculatedInputType.inputType });
    });
    return typesList;
  }

  static calculateInputType(attribute: AttributeDef, inputTypeService: InputTypeService): CalculatedInputType {
    const inputTypeName = attribute.inputType;
    let inputType: InputType;
    inputTypeService.getInputTypeById(inputTypeName).pipe(take(1)).subscribe(type => {
      inputType = type;
    });
    return {
      inputType: inputTypeName,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
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
      wrappers.push(WrappersConstants.EavLocalizationWrapper);
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
        WrappersConstants.EavLocalizationWrapper,
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
