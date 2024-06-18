import { VersioningOptions } from '.';
import { DialogContext } from '../../../app-administration/models';
import { EditSettings } from '../../dialog/main/edit-dialog-main.models';

/** 
 * IMPORTANT! These are constants that form was loaded with. They do not change while form is running
 * 
 * These values apply to the entire form, having multiple entities
 */
export interface FormConfiguration {
  zoneId: string;
  appId: string;
  appRoot: string;
  appSharedRoot: string;
  moduleId: string;
  partOfPage: string;
  portalRoot: string;
  tabId: string;
  systemRoot: string;
  versioningOptions: VersioningOptions;
  formId: number;
  isParentDialog: boolean;
  itemGuids: string[];
  createMode: boolean;
  isCopy: boolean;
  enableHistory: boolean;
  enableFormulaSave: boolean;
  overrideEditRestrictions: boolean;
  dialogContext: DialogContext;
  settings: EditSettings;
}
