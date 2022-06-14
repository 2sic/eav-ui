import { ContentType } from '../../app-administration/models';
import { ScopeOption } from '../../shared/constants/eav.constants';

export interface MetadataSaveFormValues {
  contentType: string;
}

export interface MetadataSaveDialogTemplateVars {
  contentTypes: ContentType[];
  scopeOptions: ScopeOption[];
}
