export interface AdamConfig {
  /**
   * From Field Settings
   */
  rootSubfolder: string;
  /**
   * From Field Settings
   */
  fileFilter: string;
  /**
   * From Field Settings
   */
  allowAssetsInRoot: boolean;
  /**
   * From Field Settings
   */
  folderDepth: number;
  /**
   * From Field Settings
   */
  metadataContentTypes: string;
  /**
   * Toggle
   */
  usePortalRoot: boolean;
  /**
   * Toggle
   */
  showImagesOnly: boolean;
  /**
   * Calculated
   */
  autoLoad: boolean;
  /**
   * Calculated
   */
  enableSelect: boolean;
  /**
   * Calculated
   */
  subfolder: string;
  /**
   * Calculated
   */
  allowEdit: boolean;
  /**
   * Calculated
   */
  disabled: boolean;
  /**
   * Calculated
   */
  maxDepthReached: boolean;
}
