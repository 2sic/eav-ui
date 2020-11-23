import { ApiCall, Scenario } from '..';
import { ContentType } from '../../app-administration/models/content-type.model';
import { Permission } from '../../permissions/models/permission.model';

export interface DevRestTemplateVars {
  contentType: ContentType;
  currentScenario: Scenario;
  modeInternal: boolean;
  root: string;
  itemId: number;
  itemGuid: string;
  apiCalls: ApiCall[];
  folder: string;
  moduleId: number;
  scenario: Scenario;
  permissions: Permission[];
  permissionsHasAnonymous: boolean;
}
