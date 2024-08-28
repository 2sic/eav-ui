import { InputTypeConstants, InputTypeStrict } from './../../../content-type-fields/constants/input-type.constants';

const empty: InputTypeStrict[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd, InputTypeConstants.EmptyMessage];

const ends: InputTypeStrict[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];

export class EmptyFieldHelpers {
  static isEmpty(inputType: InputTypeStrict): boolean {
    return empty.includes(inputType);
  }

  static endsPreviousGroup(inputType: InputTypeStrict): boolean {
    return ends.includes(inputType);
  }

  static isGroupStart(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeConstants.EmptyDefault;
  }
  static isGroupEnd(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeConstants.EmptyEnd;
  }
  static isMessage(inputType: InputTypeStrict): boolean {
    return inputType === InputTypeConstants.EmptyMessage;
  }
}
