import { FieldSettings } from '../../../../../edit-types';
import { BaseFieldTemplateVars } from '../../base/base-field-template-vars.model';

export interface Preview {
  url: string;
  thumbnailUrl: string;
  previewUrl: string;
  floatingText: string;
  isImage: boolean;
  isKnownType: boolean;
  icon: string;
}

export interface HyperlinkDefaultTemplateVars extends BaseFieldTemplateVars {
  open: boolean;
  buttons: string;
  settings: FieldSettings;
  value: string;
  preview: Preview;
  label: string;
  placeholder: string;
  required: boolean;
}
