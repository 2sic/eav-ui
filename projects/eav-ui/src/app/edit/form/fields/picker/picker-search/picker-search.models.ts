import { EntityInfo } from 'projects/edit-types';
import { ControlStatus } from '../../../../shared/models';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';

export interface EntitySearchViewModel {
  debugEnabled: boolean;
  allowMultiValue: boolean;
  enableCreate: boolean;
  entityType: string;
  enableAddExisting: boolean;
  enableTextEntry: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: EntityInfo[];
  error: string;
  controlStatus: ControlStatus<string | string[]>;
  freeTextMode: boolean;
  disableAddNew: boolean;
  label: string;
  placeholder: string;
  required: boolean;
}