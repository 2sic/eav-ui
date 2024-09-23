import { InputTypeCatalog, InputTypeStrict } from './input-type-catalog';

const empty: InputTypeStrict[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd, InputTypeCatalog.EmptyMessage];

const ends: InputTypeStrict[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd];

const oldValuePickers: InputTypeStrict[] = [
  InputTypeCatalog.StringDropdown,
  InputTypeCatalog.NumberDropdown,
];

const oldEntityPickers: InputTypeStrict[] = [
  InputTypeCatalog.EntityContentBlocks,
  InputTypeCatalog.EntityDefault,
  InputTypeCatalog.EntityQuery,
];

const oldOtherPickers: InputTypeStrict[] = [
  InputTypeCatalog.StringDropdownQuery,
  InputTypeCatalog.StringTemplatePicker,
];

const newPicker: InputTypeStrict[] = [
  InputTypeCatalog.EntityPicker,
  InputTypeCatalog.StringPicker,
  InputTypeCatalog.NumberPicker,
];

export class InputTypeHelpers {
  static isEmpty(inputType: InputTypeStrict): boolean {
    return empty.includes(inputType);
  }

  static endsPreviousGroup(inputType: InputTypeStrict): boolean {
    return ends.includes(inputType);
  }

  static isGroupStart(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeCatalog.EmptyDefault;
  }
  
  static isGroupEnd(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeCatalog.EmptyEnd;
  }

  static isMessage(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeCatalog.EmptyMessage;
  }

  /** True if it's either an EntityPicker, StringPicker or NumberPicker */
  static isNewPicker(inputType: InputTypeStrict): boolean {
    return newPicker.includes(inputType);
  }

  static isOldValuePicker(inputType: InputTypeStrict): boolean {
    return oldValuePickers.includes(inputType);
  }

  static isAnyPicker(inputType: InputTypeStrict): boolean {
    return newPicker.includes(inputType)
      || oldValuePickers.includes(inputType)
      || oldEntityPickers.includes(inputType)
      || oldOtherPickers.includes(inputType);
  }
}
