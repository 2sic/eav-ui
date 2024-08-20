import { CalculatedInputType } from '../../state/fields-configs.model';
import { InputTypeConstants, InputTypeStrict } from './../../../content-type-fields/constants/input-type.constants';

const empty: InputTypeStrict[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd, InputTypeConstants.EmptyMessage];

const ends: InputTypeStrict[] = [InputTypeConstants.EmptyDefault, InputTypeConstants.EmptyEnd];

export class EmptyFieldHelpers {
  static isEmptyField(inputType: CalculatedInputType): boolean {
    return this.isEmptyInputType(inputType.inputType);
    // const itName = inputType.inputType;
    // return itName === InputTypeConstants.EmptyDefault || itName === InputTypeConstants.EmptyEnd || itName === InputTypeConstants.EmptyMessage;
  }

  static isEmptyInputType(inputType: InputTypeStrict): boolean {
    return empty.includes(inputType);
  }

  static endsPreviousGroup(inputType: InputTypeStrict): boolean {
    return ends.includes(inputType);
  }

  // static isGroup(inputType: CalculatedInputType): boolean {
  //   return this.endsPreviousGroup(inputType.inputType);
  //   // const itName = inputType.inputType;
  //   // return itName === InputTypeConstants.EmptyDefault || itName === InputTypeConstants.EmptyEnd;
  // }

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
