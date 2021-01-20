import { FieldSettings } from '../../../../../edit-types';
import { EntityInfo } from '../../../../shared/models';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface SelectedEntity {
  value: string;
  label: string;
  tooltip: string;
  isFreeTextOrNotFound: boolean;
}

export interface EntityTemplateVars extends BaseFieldTemplateVars {
  label: string;
  placeholder: string;
  required: boolean;
  invalid: boolean;
  freeTextMode: boolean;
  settings: FieldSettings;
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
