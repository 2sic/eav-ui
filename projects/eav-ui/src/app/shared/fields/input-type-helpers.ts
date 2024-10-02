import { Of } from '../../../../../core';
import { InputTypeCatalog } from './input-type-catalog';

const empty: Of<typeof InputTypeCatalog>[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd, InputTypeCatalog.EmptyMessage];

const ends: Of<typeof InputTypeCatalog>[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd];

const oldValuePickers: Of<typeof InputTypeCatalog>[] = [
  InputTypeCatalog.StringDropdown,
  InputTypeCatalog.NumberDropdown,
];

const oldEntityPickers: Of<typeof InputTypeCatalog>[] = [
  InputTypeCatalog.EntityContentBlocks,
  InputTypeCatalog.EntityDefault,
  InputTypeCatalog.EntityQuery,
];

const oldOtherPickers: Of<typeof InputTypeCatalog>[] = [
  InputTypeCatalog.StringDropdownQuery,
  InputTypeCatalog.StringTemplatePicker,
];

const newPicker: Of<typeof InputTypeCatalog>[] = [
  InputTypeCatalog.EntityPicker,
  InputTypeCatalog.StringPicker,
  InputTypeCatalog.NumberPicker,
];

export class InputTypeHelpers {
  static isEmpty(inputType: Of<typeof InputTypeCatalog>): boolean {
    return empty.includes(inputType);
  }

  static endsPreviousGroup(inputType: Of<typeof InputTypeCatalog>): boolean {
    return ends.includes(inputType);
  }

  static isGroupStart(inputType: Of<typeof InputTypeCatalog>): boolean {
    return inputType === InputTypeCatalog.EmptyDefault;
  }

  static isGroupEnd(inputType: Of<typeof InputTypeCatalog>): boolean {
    return inputType === InputTypeCatalog.EmptyEnd;
  }

  static isMessage(inputType: Of<typeof InputTypeCatalog>): boolean {
    return inputType === InputTypeCatalog.EmptyMessage;
  }

  /** True if it's either an EntityPicker, StringPicker or NumberPicker */
  static isNewPicker(inputType: Of<typeof InputTypeCatalog>): boolean {
    return newPicker.includes(inputType);
  }

  static isOldValuePicker(inputType: Of<typeof InputTypeCatalog>): boolean {
    return oldValuePickers.includes(inputType);
  }

  static isAnyPicker(inputType: Of<typeof InputTypeCatalog>): boolean {
    return newPicker.includes(inputType)
      || oldValuePickers.includes(inputType)
      || oldEntityPickers.includes(inputType)
      || oldOtherPickers.includes(inputType);
  }
}
