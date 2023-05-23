import { InputTypeConstants } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';
import { CalculatedInputType } from '../../../shared/models/calculated-input-type.model';

export class EmptyFieldHelpers {
  static isEmptyField(inputType: CalculatedInputType): boolean {
    const itName = inputType.inputType;
    return itName === InputTypeConstants.EmptyDefault || itName === InputTypeConstants.EmptyEnd || itName === InputTypeConstants.EmptyMessage;
  }

  static isGroup(inputType: CalculatedInputType): boolean {
    const itName = inputType.inputType;
    return itName === InputTypeConstants.EmptyDefault || itName === InputTypeConstants.EmptyEnd;
  }  

  static isGroupStart(inputType: CalculatedInputType): boolean {
    return inputType.inputType === InputTypeConstants.EmptyDefault;
  }
  static isGroupEnd(inputType: CalculatedInputType): boolean {
    return inputType.inputType === InputTypeConstants.EmptyEnd;
  }
}