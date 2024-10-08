import { Of } from '../../../../../../core';
import { FieldSettings } from '../../../../../../edit-types/src/FieldSettings';
import { FieldValue } from '../../../../../../edit-types/src/FieldValue';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { classLog } from '../../../shared/logging';
import { ItemIdentifierShared } from '../../../shared/models/edit-form.model';

/**
 * Get the field initial / default value, incl. the prefilled value if available.
 */
export class FieldDefaults {

  log = classLog({FieldDefaults});

  constructor(
    private name: string,
    private inputType: Of<typeof InputTypeCatalog>,
    private settings: FieldSettings,
    private itemHeader?: Pick<ItemIdentifierShared, "Prefill">,
  ) { }

  /** Include itemHeader if you need data from prefill, and set onlyPrefill if you only need parsed prefill */
  getDefaultOrPrefillValue(onlyPrefill?: boolean): FieldValue {

    const inputType = this.inputType;
    const name = this.name;
    const settings = this.settings;
    const itemHeader = this.itemHeader;
    const l = this.log.fn('parseDefaultValue', { name, inputType, settings, itemHeader, onlyPrefill });

    const prefillRaw = itemHeader?.Prefill?.[name];
    if (onlyPrefill && prefillRaw === undefined)
      return l.rNull('only prefill, but no prefill data found');

    let defaultValue = prefillRaw?.toString() ?? settings.DefaultValue;

    l.values({ defaultValue });

    switch (inputType) {
      case InputTypeCatalog.BooleanDefault:
        return defaultValue?.toLowerCase() === 'true';
      case InputTypeCatalog.BooleanTristate:
        return defaultValue != null && defaultValue !== ''
          ? defaultValue.toLowerCase() === 'true'
          : null;
      case InputTypeCatalog.DateTimeDefault:
        return defaultValue != null && defaultValue !== ''
          ? new Date(defaultValue).toJSON()
          : null;
      case InputTypeCatalog.NumberDefault:
      case InputTypeCatalog.NumberDropdown:
      case InputTypeCatalog.NumberPicker:
        return defaultValue != null && defaultValue !== ''
          ? !isNaN(Number(defaultValue)) ? Number(defaultValue) : null
          : null;
      case InputTypeCatalog.EntityDefault:
      case InputTypeCatalog.EntityQuery:
      case InputTypeCatalog.EntityContentBlocks:
      case InputTypeCatalog.EntityPicker:
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
