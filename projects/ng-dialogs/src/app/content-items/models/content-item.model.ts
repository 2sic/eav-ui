export class ContentItem {
  Id: number;
  Guid: string;
  _RepositoryId: number;
  IsPublished: boolean;
  _Title: string;
  Title: string;
  Metadata?: ContentItemMetadata;
  // fields added by the user
  [key: string]: any;
}

export class ContentItemMetadata {
  TargetType: number;
  KeyNumber: number;
  KeyGuid: string;
  KeyString: string;
}
