export interface AdamItem {
  AllowEdit: boolean;
  Created: string;
  Id: number;
  IsFolder: boolean;
  MetadataId: number;
  Modified: string;
  Name: string;
  ParentId: number;
  Path: string;
  /**
   * Only available on files, not folders
   */
  PreviewUrl?: string;
  ReferenceId: string;
  Size: number;
  /**
   * Only available on files, not folders
   */
  ThumbnailUrl?: string;
  Type: string;
  /**
   * Only available on files, not folders
   */
  Url?: string;

  /**
   * Template helper
   */
  _metadataContentType?: string;
  /**
   * Template helper
   */
  _icon?: string;
  /**
   * Template helper
   */
  _isMaterialIcon?: boolean;
  /**
   * Template helper
   */
  _displaySize?: string;
}
