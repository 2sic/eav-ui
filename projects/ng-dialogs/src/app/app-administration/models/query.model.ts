import { MetadataItemShort } from '../../metadata';
import { EditInfo } from '../../shared/models/edit-info';
import { PermissionsCount } from './permissions-count.model';

export interface Query {
  AllowEdit: boolean;
  Description: string;
  Guid: string;
  Id: number;
  IsPublished: boolean;
  Metadata?: MetadataItemShort[];
  Name: string;
  ParametersGroup: null;
  Params: string;
  StreamWiring: string;
  StreamsOut: string;
  TestParameters: string;
  Title: string;
  _EditInfo: EditInfo;
  _Permissions: PermissionsCount;
  _RepositoryId: number;
  _Used: number;
  _Uses: number;
}
