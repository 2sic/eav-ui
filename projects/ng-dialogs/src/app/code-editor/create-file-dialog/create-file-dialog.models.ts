import { PredefinedTemplate } from '../models/predefined-template.model';

export interface CreateFileDialogData {
  folder?: string;
}

export interface CreateFileTemplateVars {
  guidedType: boolean;
  templates: PredefinedTemplate[];
}

export interface CreateFileFormValues {
  name: string;
  templateKey: string;
  extension: string;
  folder: string;
}

export interface CreateFileDialogResult {
  name: string;
  templateKey?: string;
}
