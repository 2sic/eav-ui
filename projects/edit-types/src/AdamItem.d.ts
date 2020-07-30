export interface AdamItem {
  Id: number,
  IsFolder: boolean,
  MetadataId: number,
  Name: string,
  ParentId: number,
  Path: string,
  Size: number,
  Type: string,
  FullPath: string,
  AllowEdit: boolean,
  Created: string,
  Modified: string,

  _metadataContentType: string,
  _icon: string,
  _isMaterialIcon: boolean,
  _displaySize: string,
}
