import { InputTypeCatalog, InputTypeStrict } from './input-type-catalog';

const empty: InputTypeStrict[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd, InputTypeCatalog.EmptyMessage];

const ends: InputTypeStrict[] = [InputTypeCatalog.EmptyDefault, InputTypeCatalog.EmptyEnd];

const newPicker: InputTypeStrict[] = [InputTypeCatalog.EntityPicker, InputTypeCatalog.StringPicker, InputTypeCatalog.NumberPicker];

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

  static isNewPicker(inputType: InputTypeStrict): boolean {
    return newPicker.includes(inputType);
  }

}
