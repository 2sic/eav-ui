import { AbstractControl } from '@angular/forms';
import { PredefinedTemplate } from '../code-editor/models/predefined-template.model';

export interface CreateFileDialogData {
  folder?: string;
  purposeForce?: 'Template' | 'Api';
}

export interface CreateFileTemplateVars {
  templates: PredefinedTemplate[];
  platforms: string[];
  purposes: string[];
  preview: string;
}

export interface CreateFileFormControls {
  platform: AbstractControl;
  purpose: AbstractControl;
  templateKey: AbstractControl;
  name: AbstractControl;
  finalName: AbstractControl;
  folder: AbstractControl;
}

export interface CreateFileFormValues {
  platform: string;
  purpose: string;
  templateKey: string;
  name: string;
  finalName: string;
  folder: string;
}

export interface CreateFileDialogResult {
  name: string;
  templateKey?: string;
}
