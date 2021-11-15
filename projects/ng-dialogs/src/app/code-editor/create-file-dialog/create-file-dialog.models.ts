import { PredefinedTemplate } from '../models/predefined-template.model';

export interface CreateFileDialogData {
  folder?: string;
}

export interface CreateFileTemplateVars {
  predefinedTemplates: PredefinedTemplate[];
}

export interface CreateFileFormValues {
  name: string;
  type: string;
  extension: string;
  folder: string;
}

export interface CreateFileDialogResult {
  name: string;
  templateKey?: string;
}
