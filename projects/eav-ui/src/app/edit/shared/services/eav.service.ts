import { Injectable } from '@angular/core';
import { DialogContext } from '../../../app-administration/models';
import { keyPartOfPage, keyPublishing, partOfPageDefault } from '../../../shared/constants/session.constants';
import { Context } from '../../../shared/services/context';
import { EditSettings } from '../../dialog/main/edit-dialog-main.models';
import { EavConfig, VersioningOptions } from '../models';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class EavService {
  /** WARNING! These are constants that form was loaded with. They do not change while form is running */
  eavConfig: EavConfig;

  settings: EditSettings;

  constructor(
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context
  ) {}

  /** Create EavConfiguration from sessionStorage */
  setEavConfig(
    dialogContext: DialogContext,
    formId: number,
    isParentDialog: boolean,
    itemGuids: string[],
    createMode: boolean,
    isCopy: boolean,
    enableHistory: boolean,
    settings: EditSettings
  ) {
    this.settings = settings;
    this.eavConfig = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      appRoot: dialogContext.App.Url,
      appSharedRoot: dialogContext.App.SharedUrl,
      lang: dialogContext.Language.Current,
      langPri: dialogContext.Language.Primary,
      langs: dialogContext.Language.List,
      moduleId: this.context.moduleId?.toString(),
      partOfPage: sessionStorage.getItem(keyPartOfPage) ?? partOfPageDefault,
      portalRoot: dialogContext.Site.Url,
      tabId: this.context.tabId?.toString(),
      systemRoot: window.location.pathname.split('/dist/')[0] + '/',
      versioningOptions: this.getVersioningOptions(
        sessionStorage.getItem(keyPartOfPage) === 'true',
        sessionStorage.getItem(keyPublishing)
      ),
      formId,
      isParentDialog,
      itemGuids,
      createMode,
      isCopy,
      enableHistory,
      enableFormulaSave: dialogContext.Enable.FormulaSave ?? false,
      overrideEditRestrictions:
        dialogContext.Enable.OverrideEditRestrictions ?? false,
      dialogContext,
      settings,
    };
  }

  private getVersioningOptions(
    partOfPage: boolean,
    publishing: string
  ): VersioningOptions {
    const allowAll: VersioningOptions = {
      show: true,
      hide: true,
      branch: true,
    };
    if (!partOfPage) {
      return allowAll;
    }

    const publish = publishing || '';
    switch (publish) {
      case '':
      case 'DraftOptional':
        return allowAll;
      case 'DraftRequired':
        // Note: the key 'show' should not be added, as the code later picks the first property to set the default
        // Branch should also be first, as it's the preferred option
        return { branch: true, hide: true };
      case 'DraftForbidden':
        return { show: true };
      default: {
        console.error(`Invalid versioning requirements: ${publish}`);
        return {};
      }
    }
  }
}
