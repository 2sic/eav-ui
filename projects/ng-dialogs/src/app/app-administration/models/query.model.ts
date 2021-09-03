import { PermissionsCount } from './permissions-count.model';

export interface Query {
  AllowEdit: boolean;
  Description: string;
  Guid: string;
  Id: number;
  IsPublished: boolean;
  Name: string;
  ParametersGroup: null;
  Params: string;
  StreamWiring: string;
  StreamsOut: string;
  TestParameters: string;
  Title: string;
  _Permissions: PermissionsCount;
  _RepositoryId: number;
  _Used: number;
  _Uses: number;
}
