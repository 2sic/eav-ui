/**
 * Configuration to create a TinyMCE
 */
export interface InitialConfig {
  containerClass: string;
  fixedToolbarClass: string;
  contentStyle: string;
  setup: (editor: any) => any;
  currentLang: string;
  contentBlocksEnabled: boolean;
  pasteFormattedTextEnabled: boolean;
  pasteImageFromClipboardEnabled: boolean;
  imagesUploadUrl: string;
  uploadHeaders: any;

  /** form inline mode (without expandable). Not to be confused with tinymce inline */
  inlineMode: boolean;
  buttonSource: string;
  buttonAdvanced: string;
}
