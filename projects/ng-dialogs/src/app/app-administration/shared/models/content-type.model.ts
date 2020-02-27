export class ContentType {
  Description: string;
  Fields: number;
  I18nKey: string;
  Id: number;
  Items: number;
  Label: string;
  Metadata: ContentTypeMetadata;
  Name: string;
  Scope: string;
  SharedDefId: number;
  StaticName: string;
  UsesSharedDef: boolean;
}

export class ContentTypeMetadata {
  Description: string;
  EditInstructions: string;
  Icon: string;
  Id: number;
  Label: string;
  Link: string;
  ListInstructions: any; // spm figure out the type
  Notes: string;
  Title: string;
}
