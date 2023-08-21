import { ControlStatus } from '../../../shared/models';

/** Template vars required in all fields */
export interface BaseFieldViewModel {
  controlStatus: ControlStatus;
  label: string;
  placeholder: string;
  required: boolean;
}
