import { WIPDataSourceItem } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface PickerSearchViewModel {
  debugEnabled: boolean;
  allowMultiValue: boolean;
  enableAddExisting: boolean;
  enableTextEntry: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableRemove: boolean;
  enableReselect: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: WIPDataSourceItem[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  label: string;
  required: boolean;
  selectedEntity: SelectedEntity;
  filteredEntities: WIPDataSourceItem[];

  // added for easier readability
  showEmpty: boolean;
  hideDropdown: boolean;
  showItemEditButtons: boolean;
}
