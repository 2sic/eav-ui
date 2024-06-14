import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerTextViewModel {
  controlStatus: ControlStatus<string | string[]>;
  label: string;
  placeholder: string;
  required: boolean;

  isSeparatorNewLine: boolean;
}
