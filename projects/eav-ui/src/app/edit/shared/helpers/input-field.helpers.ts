import { FieldSettings, FieldValue } from '../../../../../../edit-types';
import { InputTypeStrict, InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { ItemAddIdentifier, ItemIdentifierShared } from '../../../shared/models/edit-form.model';
import { EmptyFieldHelpers } from '../../fields/basic/empty-field-helpers';
import { WrappersConstant, WrappersConstants } from '../../fields/wrappers/wrappers.constants';
import { CalculatedInputType } from '../models';
import { EavItem } from '../models/eav';

const logThis = false;

export class InputFieldHelpers {

  static getContentTypeNameId(item: EavItem): string {
    return item.Entity.Type?.Id
      ?? (item.Header as ItemAddIdentifier).ContentTypeName;
  }

  static getWrappers(settings: FieldSettings, calculatedInputType: CalculatedInputType) {
    const inputType = calculatedInputType.inputType;
    const isExternal = calculatedInputType.isExternal;

    if (EmptyFieldHelpers.isMessage(inputType))
      return [];

    // empty input type wrappers
    if (EmptyFieldHelpers.isGroupStart(inputType))
      return [WrappersConstants.CollapsibleWrapper];

    // default wrappers
    const wrappers: WrappersConstant[] = [WrappersConstants.HiddenWrapper];

    // entity-default/string-dropdown wrappers
    const isEntityOrStringDropdownType = (inputType === InputTypeConstants.EntityDefault)
      || (inputType === InputTypeConstants.StringDropdownQuery)
      || (inputType === InputTypeConstants.EntityQuery)
      || (inputType === InputTypeConstants.EntityContentBlocks)
      || (inputType === InputTypeConstants.StringDropdown)
      /** WIP pickers */
      || (inputType === InputTypeConstants.EntityPicker)
      || (inputType === InputTypeConstants.StringPicker);
    // || (inputType === InputTypeConstants.WIPNumberPicker);

    const allowMultiValue = settings.AllowMultiValue ?? false;

    if (isEntityOrStringDropdownType) {
      wrappers.push(WrappersConstants.LocalizationWrapper);
      if (allowMultiValue || inputType === InputTypeConstants.EntityContentBlocks)
        wrappers.push(WrappersConstants.PickerExpandableWrapper);
    }

    // External components should always get these wrappers
    if (isExternal)
      wrappers.push(
        WrappersConstants.DropzoneWrapper,
        WrappersConstants.LocalizationWrapper,
        WrappersConstants.ExpandableWrapper,
        WrappersConstants.AdamWrapper,
      );

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
    const log = new EavLogger('InputFieldHelpers', logThis);
    const l = log.fn('parseDefaultValue', { name, inputType, settings, itemHeader, onlyPrefill });

    if (onlyPrefill && itemHeader?.Prefill?.[name] === undefined)
      return l.rNull('only prefill, but no prefill data found');

    let defaultValue = itemHeader?.Prefill?.[name]?.toString()
      ?? settings.DefaultValue;

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
