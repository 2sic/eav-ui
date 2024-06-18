import { AdamItem } from '../../../../../../../../edit-types';
export interface Preview {
  url: string;
  thumbnailUrl: string;
  previewUrl: string;
  floatingText: string;
  isImage: boolean;
  isKnownType: boolean;
  icon: string;
}

export interface HyperlinkDefaultViewModel {
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
  enableImageConfiguration: boolean;
}
