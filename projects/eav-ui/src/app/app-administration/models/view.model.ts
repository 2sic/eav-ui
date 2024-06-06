import { LightSpeedInfo } from '../../apps-management/models/LightSpeedInfo';
import { MetadataItemShort } from '../../metadata';
import { EditInfo } from '../../shared/models/edit-info';
import { PermissionsCount } from './permissions-count.model';

export interface View {
  ContentType: ViewEntity;
  EditInfo: EditInfo;
  Guid: string;
  HasQuery: boolean;
  Id: number;
  IsHidden: boolean;
  /** If it's stored in a shared location - usually the 0 Portal in DNN */
  IsShared: boolean;
  List: boolean;
  ListContentType: ViewEntity;
  ListPresentationType: ViewEntity;
  Metadata: MetadataItemShort[];
  Name: string;
  Permissions: PermissionsCount;
  PresentationType: ViewEntity;
  TemplatePath: string;
  /** How often this is used in ContentBlocks */
  Used: number;
  ViewNameInUrl: string;

  /** new 17.10 */
  lightSpeed?: LightSpeedInfo;
}

export interface ViewEntity {
  DemoId: number;
  DemoTitle: string;
  Id: number;
  Name: string;
  StaticName: string;
}
