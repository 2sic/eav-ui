
export interface AdamItem {
  AllowEdit: boolean;

  /** Optional error message if something fails */
  Error?: string;

  Created: string;

  /** The ID of the file system - normally a number; but in special platforms can be a string */
  Id: number | string;

  IsFolder: boolean;
  Metadata?: AdamItemMetadata[];
  Modified: string;

  /** The nice name of the file, without path */
  Name: string;

  ParentId: number;
  Path: string;
  /**
   * Only available on files, not folders
   */
  PreviewUrl?: string;

  /**
   * The id such as "file:42" to reference this file
   * #useReferenceId
   */
  ReferenceId: string;

  Size: number;
  /**
   * Only available on files, not folders
   */
  ThumbnailUrl?: string;

  /**
   * The ADAM type, such as "folder" or "image"
   */
  Type: string;

  /**
   * The url to get this file.
   * Only available on files, not folders
   */
  Url?: string;

  /**
   * Template helper
   */
  _imageConfigurationContentType?: string;
  /**
   * Template helper
   */
  _imageConfigurationId?: number;
  /**
   * Template helper
   */
  _metadataContentType?: string;
  /**
   * Template helper
   */
  _metadataId?: number;
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

export interface AdamItemMetadata {
  Guid: string;
  Id: number;
  Type: AdamItemMetadataType;
}

export interface AdamItemMetadataType {
  Id: string;
  Name: string;
}
