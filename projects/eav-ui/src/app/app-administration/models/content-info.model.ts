export interface ContentInfo {
  ContentTypes: ContentInfoContentType[];
  TemplatesWithoutContentTypes: ContentInfoTemplate[];
}

export interface ContentInfoContentType {
  Id: number;
  Name: string;
  StaticName: string;
  Templates: ContentInfoTemplate[];
  Entities: ContentInfoEntity[];
  _export?: boolean;
}

export interface ContentInfoTemplate {
  Id: number;
  Name: string;
  _export?: boolean;
}

export interface ContentInfoEntity {
  Title: string;
  Id: number;
  _export?: boolean;
}
