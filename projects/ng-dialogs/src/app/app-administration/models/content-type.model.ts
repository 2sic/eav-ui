import { PermissionsCount } from './permissions-count.model';

export interface ContentType {
  Description: string;
  Fields: number;
  Id: number;
  Items: number;
  Label: string;
  Metadata: ContentTypeMetadata;
  Name: string;
  Permissions: PermissionsCount;
  Scope: string;
  SharedDefId: number;
  StaticName: string;
  UsesSharedDef: boolean;
}

export interface ContentTypeMetadata {
  Description: string;
  EditInstructions: string;
  Icon: string;
  Id: number;
  Label: string;
  Link: string;
  ListInstructions: any;
  Notes: string;
  Title: string;
}

export interface ContentTypeEdit extends ContentType {
  ChangeStaticName: boolean;
  NewStaticName: string;
}
