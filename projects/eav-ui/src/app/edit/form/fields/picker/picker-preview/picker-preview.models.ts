import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface EntityPickerPreviewTemplateVars {
  selectedEntities: SelectedEntity[];
  freeTextMode: boolean;
  enableTextEntry: boolean;
  controlStatus: ControlStatus<string | string[]>;
}
