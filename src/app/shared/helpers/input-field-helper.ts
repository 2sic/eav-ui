import { FieldConfigSet, FieldConfigGroup } from '../../eav-dynamic-form/model/field-config';
import { InputTypesConstants } from '../constants/input-types-constants';
import { AttributeDef } from '../models/eav/attribute-def';
import { FieldSettings, EavHeader, Item } from '../models/eav';
import { WrappersConstants } from '../constants/wrappers-constants';
import { InputTypeName, CalculatedInputType } from '../models/input-field-models';

export class InputFieldHelper {
    /**
     * This is attribute type (not attribute inputType)
     * @param config
     * @param attributeKey
     */
    static getFieldType(config: FieldConfigSet, attributeKey: string): string {
        if (config.field.type) {
            return config.field.type;
        } else {
            const field = config.field as FieldConfigGroup;
            return this.getFieldTypeFromFieldGroup(field.fieldGroup, attributeKey);
        }
    }

    /**
     * loop through fieldGroup configuration recursively to get type
     * Form group configuration have configuration from all child fields.
     * @param fieldGroup
     * @param attributeKey
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
        return item.entity.type ? item.entity.type.id : item.header.contentTypeName;
    }

    static getFieldLabel = (attribute: AttributeDef, settingsTranslated: FieldSettings): string => {
        return settingsTranslated && settingsTranslated.Name || attribute.name;
    }

    /**
     *  Get input type names from content type attributes
     * @param attributesList
     */
    static getInputTypeNamesFromAttributes(attributesList: AttributeDef[]): InputTypeName[] {
        const typesList: InputTypeName[] = [];

        attributesList.forEach((attribute, index) => {
            try {
                const name = attribute.name;
                const calculatedInputType = this.getInputTypeNameFromAttribute(attribute);
                typesList.push({ name: name, inputType: calculatedInputType.inputType });
            } catch (error) {
                console.error(`loadContentTypeFormFields(...) - error loading attribut ${index}`, attribute);
                throw error;
            }
        });

        return typesList;
    }

    static getInputTypeNameFromAttribute(attribute: AttributeDef): CalculatedInputType {
        // can't read input type at all so return string-default
        if (!(attribute.settings.InputType || attribute.type)) {
            return { inputType: InputTypesConstants.stringDefault, isExternal: false };
        }

        let inputTypeName = attribute.settings.InputType
            && attribute.settings.InputType.values[0].value;

        inputTypeName = inputTypeName
            ? this.renameOldInputTypes(inputTypeName)
            : this.createInputTypeFromTypeName(attribute.type);

        return this.checkIfExternal(inputTypeName);
    }

    private static renameOldInputTypes(inputTypeName: string): string {
        switch (inputTypeName) {
            case InputTypesConstants.oldTypeDefault:
                return InputTypesConstants.stringDefault;
            case InputTypesConstants.oldTypeDropdown:
                return InputTypesConstants.stringDropdown;
            case InputTypesConstants.oldTypeWysiwyg:
                return InputTypesConstants.stringWysiwyg;

            // spm remove renaming of wysiwyg when backend is ready
            case InputTypesConstants.stringWysiwygTinymce:
                return InputTypesConstants.stringWysiwyg;
            case InputTypesConstants.stringWysiwygAdv:
                return InputTypesConstants.stringWysiwyg;
            case InputTypesConstants.stringWysiwygDnn:
                return InputTypesConstants.stringWysiwyg;

            default: return inputTypeName;
        }
    }

    private static createInputTypeFromTypeName(typeName: string): string {
        switch (typeName) {
            // cases where typename === inputTypeName
            case InputTypesConstants.stringUrlPath:
            case InputTypesConstants.stringFontIconPicker:
            case InputTypesConstants.hyperlinkLibrary:
                return typeName;

            // convert to `${typeName}-default`
            case InputTypesConstants.string:
            case InputTypesConstants.empty:
            case InputTypesConstants.datetime:
            case InputTypesConstants.number:
            case InputTypesConstants.entity:
            case InputTypesConstants.hyperlink:
            case InputTypesConstants.boolean:
            case InputTypesConstants.custom:

            default:
                return typeName.toLocaleLowerCase() + InputTypesConstants.defaultSuffix;
        }
    }

    private static checkIfExternal(inputTypeName: string): CalculatedInputType {
        switch (inputTypeName) {
            case InputTypesConstants.stringDefault:
            case InputTypesConstants.stringUrlPath:
            case InputTypesConstants.booleanDefault:
            case InputTypesConstants.stringDropdown:
            case InputTypesConstants.stringDropdownQuery:
            case InputTypesConstants.emptyDefault:
            case InputTypesConstants.datetimeDefault:
            case InputTypesConstants.numberDefault:
            case InputTypesConstants.stringFontIconPicker:
            case InputTypesConstants.entityDefault:
            case InputTypesConstants.entityQuery:
            case InputTypesConstants.entityContentBlocks:
            case InputTypesConstants.hyperlinkDefault:
            case InputTypesConstants.hyperlinkLibrary:
            case InputTypesConstants.stringTemplatePicker:
            case InputTypesConstants.customDefault:
                return { inputType: inputTypeName, isExternal: false };

            // our external components
            case InputTypesConstants.stringWysiwyg:
            case InputTypesConstants.stringWysiwygTinymce:
            case InputTypesConstants.stringWysiwygAdv:
            case InputTypesConstants.stringWysiwygDnn:
            case InputTypesConstants.customGPS:
                return { inputType: inputTypeName, isExternal: true };

            // other external components
            default:
                return { inputType: inputTypeName, isExternal: true };
        }
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
            if (
                inputType === InputTypesConstants.stringWysiwyg
                || inputType === InputTypesConstants.stringWysiwygAdv
                || inputType === InputTypesConstants.stringWysiwygDnn
                || inputType === InputTypesConstants.stringWysiwygTinymce
            ) {
                wrappers.push(
                    WrappersConstants.dropzoneWrapper,
                    WrappersConstants.eavLocalizationWrapper,
                    WrappersConstants.expandableWrapper,
                    WrappersConstants.adamAttachWrapper
                );
            } else if (inputType === InputTypesConstants.customGPS) {
                wrappers.push(
                    WrappersConstants.eavLocalizationWrapper,
                    WrappersConstants.expandableWrapperV2,
                );
            } else {
                wrappers.push(
                    WrappersConstants.eavLocalizationWrapper,
                );
            }
        }

        return wrappers;
    }

    static parseDefaultValue(attributeKey: string, inputType: string, settings: FieldSettings, header: EavHeader): any {
        let defaultValue = settings.DefaultValue;

        if (header.prefill && header.prefill[attributeKey]) {
            defaultValue = header.prefill[attributeKey];
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
