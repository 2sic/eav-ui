import { EavScopeOption } from '../../../shared/constants/eav.constants';
import { ContentType } from '../../models';

export interface MetadataSaveDialogTemplateVars {
  contentTypes: ContentType[];
  disableAnimation: boolean;
  formValues: Record<string, string>;
  lockScope: boolean;
  scopeOptions: EavScopeOption[];
}

export interface MetadataSaveDialogData {
  scope?: string;
}
