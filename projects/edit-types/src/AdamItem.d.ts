export interface AdamItem {
  AllowEdit: boolean,
  Created: string,
  Id: number,
  IsFolder: boolean,
  MetadataId: number,
  Modified: string,
  Name: string,
  ParentId: number,
  Path: string,
  PreviewUrl: string;
  Size: number,
  ThumbnailUrl: string;
  Type: string,
  Url: string,

  _metadataContentType: string,
  _icon: string,
  _isMaterialIcon: boolean,
  _displaySize: string,
}
