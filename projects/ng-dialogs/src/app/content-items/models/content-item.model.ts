export interface ContentItem {
  Id: number;
  Guid: string;
  _RepositoryId: number;
  IsPublished: boolean;
  _Title: string;
  Title: string;
  For?: ContentItemFor;
  Metadata?: ContentItemMetadata[];

  /** How often this is being used by other entities (parents) */
  _Used: number;

  /** How often this entity uses other entities (children) */
  _Uses: number;

  // fields added by the user
  [key: string]: any;
}

export interface ContentItemFor {
  Target: number;
  Number?: number;
  Guid?: string;
  String?: string;
}

export interface ContentItemMetadata {
  Guid: string;
  Id: number;
  Title: string;
}
