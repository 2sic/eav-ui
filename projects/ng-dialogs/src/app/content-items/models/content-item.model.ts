export class ContentItem {
  Id: number;
  Guid: string;
  _RepositoryId: number;
  IsPublished: boolean;
  _Title: string;
  Title: string;
  For?: ContentItemMetadata;

  /** How often this is being used by other entities (parents) */
  _Used: number;

  /** How often this entity uses other entities (children) */
  _Uses: number;

  // fields added by the user
  [key: string]: any;
}

export class ContentItemMetadata {
  Target: number;
  Number: number;
  Guid: string;
  String: string;
}
