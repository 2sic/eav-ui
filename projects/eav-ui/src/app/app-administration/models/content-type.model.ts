import { MetadataItemShort } from '../../metadata';
import { EditInfo } from '../../shared/models/edit-info';
import { PermissionsCount } from './permissions-count.model';

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
  /**
   * TODO: @2pp - go through all usages and replace with NameId, then info 2dm to remove this property
   * But be careful, sometimes an object could be created, in which case the new NameId would also maybe need this? just be sure to really test what you're doing everywhere
   * @deprecated use NameId instead
   */
  StaticName: string;
  /** New 18.02 replaces staticName */
  NameId: string;
  // UsesSharedDef: boolean; // 2022-01-04 2dm disabled, as we're now using the EditInfo.ReadOnly instead
  EditInfo: EditInfo;
  _compareLabel?: string;
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
