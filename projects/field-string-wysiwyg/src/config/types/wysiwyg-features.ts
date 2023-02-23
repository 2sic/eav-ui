export interface WysiwygFeatures {
  contentBlocks: boolean;
  responsiveImages: boolean;
  contentSeparators: boolean;
  /**
   * Allow paste formatted.
   * Basically true all the time, but we should be able to turn it off for `text-plain`
   * TODO: not implemented yet
   */
  pasteFormatted: boolean;
  /**
   * Allow users to add images to the wysiwyg.
   * By default using drag-drop or picking from adam.
   * We should be able to turn this off in text-modes, but not implemented yet.
   * TODO: not implemented yet
   */
  addImage: boolean;
}
