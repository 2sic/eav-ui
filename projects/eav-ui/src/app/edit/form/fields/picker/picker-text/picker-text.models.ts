import { ControlStatus } from '../../../../shared/models';

export interface EntityPickerTextTemplateVars {
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  placeholder: string;
  required: boolean;
}
