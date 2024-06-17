import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerTextViewModel {
  controlStatus: ControlStatus<string | string[]>;
  // placeholder: string;

  isSeparatorNewLine: boolean;
}
