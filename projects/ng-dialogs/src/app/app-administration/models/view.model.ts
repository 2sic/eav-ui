import { PermissionsCount } from './permissions-count.model';

export class View {
  ContentType: ViewEntity;
  Guid: string;
  HasQuery: boolean;
  Id: number;
  IsHidden: boolean;
  List: boolean;
  ListContentType: ViewEntity;
  ListPresentationType: ViewEntity;
  Name: string;
  Permissions: PermissionsCount;
  PresentationType: ViewEntity;
  TemplatePath: string;

  /** How often this is used in ContentBlocks */
  Used: number;

  /** if it's stored in a shared location - usually the 0 Portal in DNN */
  IsShared: boolean;
  ViewNameInUrl: string;
}

export class ViewEntity {
  DemoId: number;
  DemoTitle: string;
  Id: number;
  Name: string;
  StaticName: string;
}
