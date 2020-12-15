import { ApiCall, Scenario } from '..';
import { ContentType } from '../../app-administration/models/content-type.model';
import { Permission } from '../../permissions/models/permission.model';

export interface DevRestDataTemplateVars {
  contentType: ContentType;
  currentScenario: Scenario;
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
