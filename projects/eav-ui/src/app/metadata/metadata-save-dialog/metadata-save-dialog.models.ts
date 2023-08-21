import { ContentType } from '../../app-administration/models';
import { ScopeOption } from '../../shared/constants/eav.constants';

export interface MetadataSaveFormValues {
  contentType: string;
}

export interface MetadataSaveDialogViewModel {
  contentTypes: ContentType[];
  scopeOptions: ScopeOption[];
}
