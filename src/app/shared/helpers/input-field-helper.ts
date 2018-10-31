import { FieldConfig } from '../../eav-dynamic-form/model/field-config';

export class InputFieldHelper {
    /**
     * This is attribute type (not attribute inputType)
     * @param config
     * @param attributeKey
     */
    static getFieldType(config: FieldConfig, attributeKey: string): string {
        if (config.type) {
            return config.type;
        } else {
            return this.getFieldTypeFromFieldGroup(config.fieldGroup, attributeKey);
        }
    }

    /**
     * loop through fieldGroup configuration recursively to get type
     * Form group configuration have configuration from all child fields.
     * @param fieldGroup
     * @param attributeKey
     */
    static getFieldTypeFromFieldGroup(fieldGroup: FieldConfig[], attributeKey: string) {
        let type;
        fieldGroup.forEach(config => {
            if (config.fieldGroup) {
                const typeFromFieldGroup = this.getFieldTypeFromFieldGroup(config.fieldGroup, attributeKey);
                if (typeFromFieldGroup) {
                    type = typeFromFieldGroup;
                }
            } else {
                if (config.name === attributeKey) {
                    type = config.type;
                }
            }
        });
        return type;
    }
}
