import { MetadataItemShort } from '../../metadata';
import { PermissionsCount } from './permissions-count.model';
import { EditInfo } from '../../shared/models/edit-info';

export interface ContentType {
  Description: string;
  Fields: number;
  Id: number;
  Items: number;
  Label: string;
  Metadata: MetadataItemShort[];
  Properties?: ContentTypeProperties;
  Name: string;
  Permissions: PermissionsCount;
  Scope: string;
  SharedDefId: number;
  StaticName: string;
  // 2022-01-04 2dm disabled, as we're now using the EditInfo.ReadOnly instead
  // UsesSharedDef: boolean;
  _compareLabel?: string;
  EditInfo: EditInfo;
}

export interface ContentTypeProperties {
  Description: string;
  EditInstructions: string;
  Icon: string;
  Id: number;
  Label: string;
  Link: string;
  ListInstructions: string;
  Notes: string;
  Title: string;
}

export interface ContentTypeEdit extends ContentType {
  ChangeStaticName: boolean;
  NewStaticName: string;
}
