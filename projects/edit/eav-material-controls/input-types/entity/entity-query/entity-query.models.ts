export interface QueryStreams {
  [stream: string]: QueryEntity[];
}

export interface QueryEntity {
  Guid: string;
  Id: number;
  Modified: string;
  Title: string;
  [key: string]: any;
  _2sxcEditInformation: QuerySxcEditInformation;
}

export interface QuerySxcEditInformation {
  entityId: number;
  isPublished: boolean;
  title: string;
}
