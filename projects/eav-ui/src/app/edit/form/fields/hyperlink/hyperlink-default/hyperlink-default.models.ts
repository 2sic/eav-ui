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
  preview: Preview;
}
