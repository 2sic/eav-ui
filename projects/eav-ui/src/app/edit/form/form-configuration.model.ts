import { Of } from '../../../../../core';
import { DialogContext } from '../../app-administration/models';
import { EditSettings, PublishModes } from '../dialog/main/edit-dialog-main.models';

/** 
 * IMPORTANT! These are constants that form was loaded with. They do not change while form is running
 * 
 * These values apply to the entire form, having multiple entities
 */
export interface FormConfiguration {
  zoneId: number;
  appId: number;
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
  /** True if for example debug mode allows to edit things which normally are not allowed */
  removeEditRestrictions: boolean;
  dialogContext: DialogContext;
  settings: EditSettings;
}


export interface VersioningOptions extends Partial<Record<Of<typeof PublishModes>, boolean>> {
}
