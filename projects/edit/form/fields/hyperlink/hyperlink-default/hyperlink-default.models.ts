import { AdamItem } from '../../../../../edit-types';
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
  buttonAdam: boolean;
  buttonPage: boolean;
  buttonMore: boolean;
  showAdam: boolean;
  showPagePicker: boolean;
  showImageManager: boolean;
  showFileManager: boolean;
  preview: Preview;
  adamItem: AdamItem;
}
