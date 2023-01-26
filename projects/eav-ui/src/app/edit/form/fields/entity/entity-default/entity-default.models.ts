import { EntityInfo } from '../../../../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface SelectedEntity {
  entityId: number;
  value: string;
  label: string;
  tooltip: string;
  // 2023-01-26 2dm - moved to disableEdit / disableDelete
  // isFreeTextOrNotFound: boolean;
  disableEdit: boolean;
  disableDelete: boolean;
  /** debug info only */
  _sourceIsQuery: boolean;
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
