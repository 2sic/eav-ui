import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DialogContext } from '../../../ng-dialogs/src/app/app-administration/models';
import { keyPartOfPage, keyPublishing } from '../../../ng-dialogs/src/app/shared/constants/session.constants';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { EavFormData, SaveEavFormData } from '../../dialog/main/edit-dialog-main.models';
import { EavConfig, SaveResult, VersioningOptions } from '../models';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class EavService {
  /** WARNING! These are constants that form was loaded with. They do not change while form is running */
  eavConfig: EavConfig;

  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
  ) { }

  /** Create EavConfiguration from sessionStorage */
  setEavConfig(
    dialogContext: DialogContext,
    formId: number,
    isParentDialog: boolean,
    itemGuids: string[],
    createMode: boolean,
    isCopy: boolean,
    enableHistory: boolean,
  ) {
    this.eavConfig = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      appRoot: dialogContext.App.Url,
      lang: dialogContext.Language.Current,
      langPri: dialogContext.Language.Primary,
      langs: dialogContext.Language.List,
      moduleId: this.context.moduleId.toString(),
      partOfPage: sessionStorage.getItem(keyPartOfPage),
      portalRoot: dialogContext.Site.Url,
      tabId: this.context.tabId.toString(),
      systemRoot: window.location.pathname.split('/dist/')[0] + '/',
      versioningOptions: this.getVersioningOptions(
        sessionStorage.getItem(keyPartOfPage) === 'true',
        sessionStorage.getItem(keyPublishing),
      ),
      formId,
      isParentDialog,
      itemGuids,
      createMode,
      isCopy,
      enableHistory,
      enableFormulaSave: dialogContext.Enable.FormulaSave ?? false,
    };
  }

  fetchFormData(items: string) {
    return this.http.post<EavFormData>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.context.appId.toString() }
    });
  }

  saveFormData(result: SaveEavFormData, partOfPage: string) {
    return this.http.post<SaveResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.eavConfig.appId, partOfPage }
    });
  }

  private getVersioningOptions(partOfPage: boolean, publishing: string): VersioningOptions {
    if (!partOfPage) {
      return { show: true, hide: true, branch: true };
    }

    const publish = publishing || '';
    switch (publish) {
      case '':
      case 'DraftOptional':
        return { show: true, hide: true, branch: true };
      case 'DraftRequired':
        return { branch: true, hide: true };
      default: {
        console.error('invalid versioning requiremenets: ' + publish);
        return {};
      }
    }
  }

}
