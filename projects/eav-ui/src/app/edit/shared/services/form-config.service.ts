import { Injectable } from '@angular/core';
import { DialogContext } from '../../../app-administration/models';
import { keyPartOfPage, keyPublishing, partOfPageDefault } from '../../../shared/constants/session.constants';
import { Context } from '../../../shared/services/context';
import { EditSettings } from '../../dialog/main/edit-dialog-main.models';
import { FormConfiguration, VersioningOptions } from '../models';
import { FormLanguagesConfig } from '../models/form-languages.model';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class FormConfigService {
  /**
   * Important! These are constants that form was loaded with.
   * They are initialized in the main edit-form.
   * They do not change while form is running
   */
  config: FormConfiguration;

  /**
   * Current edit settings
   * Note: Clean use - only used by classes that inject this themselves
   */
  settings: EditSettings;

  languages: FormLanguagesConfig;

  constructor(
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context
  ) {}

  /** Create EavConfiguration from sessionStorage */
  initFormConfig(
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
    this.languages = {
      current: dialogContext.Language.Current,
      primary: dialogContext.Language.Primary,
      list: dialogContext.Language.List,
    };
    this.config = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      appRoot: dialogContext.App.Url,
      appSharedRoot: dialogContext.App.SharedUrl,
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

    const allowAll: VersioningOptions = { show: true, hide: true, branch: true };
    
    if (!partOfPage)
      return allowAll;

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
