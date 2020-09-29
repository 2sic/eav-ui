import { PermissionsCount } from './permissions-count.model';

export class Query {
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
  _Title: string;
  _Used: number;
  _Uses: number;
}
