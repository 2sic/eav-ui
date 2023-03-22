import { ControlStatus } from '../../../../shared/models/control-status.model';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface EntityListViewModel {
  allowMultiValue: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  selectedEntities: SelectedEntity[];
  label: string;
  required: boolean;
  controlStatus: ControlStatus<string | string[]>;
}

export interface ReorderIndexes {
  previousIndex: number;
  currentIndex: number;
}
