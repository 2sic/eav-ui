import { ApiCall, Scenario } from '.';
import { Permission } from '../permissions/models/permission.model';

export interface DevRestBaseTemplateVars {
  /** The name used in dialogs etc. to show what we're working on */
  name: string;
  currentScenario: Scenario;
  root: string;
  itemId?: number;
  // itemGuid: string;
  apiCalls: ApiCall[];
  folder: string;
  moduleId: number;
  scenario: Scenario;

  permissions: Permission[];
  permissionsHasAnonymous: boolean;
  permissionTarget: string;
}
