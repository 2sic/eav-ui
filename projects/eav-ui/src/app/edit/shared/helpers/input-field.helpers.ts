import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';

const logThis = false;

export class FieldHelper {

  /** Include itemHeader if you need data from prefill, and set onlyPrefill if you only need parsed prefill */
  static getDefaultOrPrefillValue(
    name: string,
    inputType: InputTypeStrict,
    settings: FieldSettings,
    itemHeader?: ItemIdentifierShared,
    onlyPrefill?: boolean,
  ): FieldValue {
    const log = new EavLogger('InputFieldHelpers', logThis);
    const l = log.fn('parseDefaultValue', { name, inputType, settings, itemHeader, onlyPrefill });

    const prefillRaw = itemHeader?.Prefill?.[name];
    if (onlyPrefill && prefillRaw === undefined)
      return l.rNull('only prefill, but no prefill data found');

    let defaultValue = prefillRaw?.toString() ?? settings.DefaultValue;

    l.values({ defaultValue });

    switch (inputType) {
      case InputTypeConstants.BooleanDefault:
        return defaultValue?.toLowerCase() === 'true';
      case InputTypeConstants.BooleanTristate:
        return defaultValue != null && defaultValue !== ''
          ? defaultValue.toLowerCase() === 'true'
          : null;
      case InputTypeConstants.DateTimeDefault:
        return defaultValue != null && defaultValue !== ''
          ? new Date(defaultValue).toJSON()
          : null;
      case InputTypeConstants.NumberDefault:
      case InputTypeConstants.NumberDropdown:
      case InputTypeConstants.NumberPicker:
        return defaultValue != null && defaultValue !== ''
          ? !isNaN(Number(defaultValue)) ? Number(defaultValue) : null
          : null;
      case InputTypeConstants.EntityDefault:
      case InputTypeConstants.EntityQuery:
      case InputTypeConstants.EntityContentBlocks:
      case InputTypeConstants.EntityPicker:
        // Empty - return []
        if (defaultValue == null || defaultValue === '')
          return [];

        // string has { } characters, we must switch them to quotes for parsing below
        // 2024-06-01 2dm not sure why this is an option..., maybe some interim encoding?
        if (defaultValue.includes('{'))
          defaultValue = defaultValue.replace(/[\{\}]/g, '\"');

        // list but no array, add brackets
        if (defaultValue.includes(',') && !defaultValue.includes('[')) {
          const guids = defaultValue.split(',').map(guid => guid.trim());
          defaultValue = JSON.stringify(guids);
        }

        // Finally parse
        return defaultValue.startsWith('[') // an array with guid strings
          ? JSON.parse(defaultValue) // if it's a string containing an array
          : [defaultValue.replace(/"/g, '')]; // just a guid string, but might have quotes
      default:
        return defaultValue ?? '';
    }
  }
}
