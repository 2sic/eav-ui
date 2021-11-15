import { ContentType } from '../../app-administration/models';

export interface MetadataSaveFormValues {
  contentType: string;
}

export interface MetadataSaveDialogTemplateVars {
  contentTypes: ContentType[];
}
