export class ContentInfo {
  ContentTypes: ContentInfoContentType[];
  TemplatesWithoutContentTypes: ContentInfoTemplate[];
}

export class ContentInfoContentType {
  Id: number;
  Name: string;
  StaticName: string;
  Templates: ContentInfoTemplate[];
  Entities: ContentInfoEntity[];
  _export?: boolean;
}

export class ContentInfoTemplate {
  Id: number;
  Name: string;
  _export?: boolean;
}

export class ContentInfoEntity {
  Title: string;
  Id: number;
  _export?: boolean;
}
