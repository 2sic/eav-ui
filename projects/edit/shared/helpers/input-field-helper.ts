import { take } from 'rxjs/operators';
import { FieldConfigSet, FieldConfigGroup } from '../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../constants/input-types-constants';
import { AttributeDef } from '../models/eav/attribute-def';
import { EavHeader, Item, InputType } from '../models/eav';
import { FieldSettings } from '../../../edit-types';
import { WrappersConstants } from '../constants/wrappers-constants';
import { InputTypeName, CalculatedInputType } from '../models/input-field-models';
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
    inputTypeService.getInputTypeById(inputTypeName).pipe(take(1)).subscribe(type => { inputType = type; });
    return {
      inputType: inputTypeName,
      isExternal: inputType ? !!inputType.AngularAssets : false,
    };
  }

  static setWrappers(calculatedInputType: CalculatedInputType, settingsTranslated: FieldSettings) {
    // empty inputtype wrappers
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    const isEmptyInputType = (inputType === InputTypesConstants.emptyDefault)
      || (inputType === InputTypesConstants.empty);
    if (isEmptyInputType) {
      return [WrappersConstants.collapsibleWrapper];
    }
    // default wrappers
    const wrappers: string[] = [WrappersConstants.hiddenWrapper];
    // entity-default wrappers
    const isEntityType = (inputType === InputTypesConstants.entityDefault)
      || (inputType === InputTypesConstants.stringDropdownQuery)
      || (inputType === InputTypesConstants.entityQuery)
      || (inputType === InputTypesConstants.entityContentBlocks);

    if (isEntityType) {
      wrappers.push(WrappersConstants.eavLocalizationWrapper);
      const allowMultiValue = settingsTranslated.AllowMultiValue || false;
      if (inputType === InputTypesConstants.entityContentBlocks) {
        wrappers.push(WrappersConstants.collapsibleFieldWrapper);
      }
      if (allowMultiValue || inputType === InputTypesConstants.entityContentBlocks) {
        wrappers.push(WrappersConstants.entityExpandableWrapper);
      }
    }

    if (isExternal) {
      if (this.isWysiwygInputType(inputType)) {
        wrappers.push(
          WrappersConstants.dropzoneWrapper,
          WrappersConstants.eavLocalizationWrapper,
          WrappersConstants.expandableWrapper,
          WrappersConstants.adamAttachWrapper,
        );
      } else if (inputType === InputTypesConstants.customGPS) {
        wrappers.push(
          WrappersConstants.eavLocalizationWrapper,
          WrappersConstants.expandableWrapper,
        );
      } else {
        wrappers.push(
          WrappersConstants.eavLocalizationWrapper,
        );
      }
    }

    return wrappers;
  }

  static isWysiwygInputType(inputType: string): boolean {
    return inputType === InputTypesConstants.stringWysiwyg
      || inputType === InputTypesConstants.stringWysiwygAdv
      || inputType === InputTypesConstants.stringWysiwygDnn
      || inputType === InputTypesConstants.stringWysiwygTinymce;
  }

  static parseDefaultValue(attributeKey: string, inputType: string, settings: FieldSettings, header: EavHeader): any {
    let defaultValue = settings.DefaultValue;

    if (header.Prefill && header.Prefill[attributeKey]) {
      defaultValue = header.Prefill[attributeKey];
    }

    switch (inputType) {
      case InputTypesConstants.booleanDefault:
        return defaultValue !== undefined && defaultValue !== null
          ? defaultValue.toLowerCase() === 'true'
          : false;
      case InputTypesConstants.datetimeDefault:
        return defaultValue !== undefined && defaultValue !== null && defaultValue !== ''
          ? new Date(defaultValue)
          : null;
      case InputTypesConstants.numberDefault:
        return defaultValue !== undefined && defaultValue !== null && defaultValue !== ''
          ? Number(defaultValue)
          : '';
      case InputTypesConstants.entityDefault:
      case InputTypesConstants.entityQuery:
        if (!(defaultValue !== undefined && defaultValue !== null && defaultValue !== '')) {
          return []; // no default value
        }
        // 3 possibilities
        if (defaultValue.constructor === Array) { return defaultValue; }  // possibility 1) an array
        // for possibility 2 & 3, do some variation checking
        if (defaultValue.indexOf('{') > -1) { // string has { } characters, we must switch them to quotes
          defaultValue = defaultValue.replace(/[\{\}]/g, '\"');
        }
        if (defaultValue.indexOf(',') !== -1 && defaultValue.indexOf('[') === -1) { // list but no array, add brackets
          defaultValue = '[' + defaultValue + ']';
        }
        return (defaultValue.indexOf('[') === 0) // possibility 2) an array with guid strings
          ? JSON.parse(defaultValue) // if it's a string containing an array
          : [defaultValue.replace(/"/g, '')]; //  possibility 3) just a guid string, but might have quotes
      default:
        return defaultValue ? defaultValue : '';
    }
  }
}
