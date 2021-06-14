import { EntityInfo } from '../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface SelectedEntity {
  value: string;
  label: string;
  tooltip: string;
  isFreeTextOrNotFound: boolean;
}

export interface EntityTemplateVars extends BaseFieldTemplateVars {
  freeTextMode: boolean;
  allowMultiValue: boolean;
  selectedEntities: SelectedEntity[];
  availableEntities: EntityInfo[];
  disableAddNew: boolean;
  isExpanded: boolean;
  error: string;
}

export interface DeleteEntityProps {
  index: number;
  entityGuid: string;
}
