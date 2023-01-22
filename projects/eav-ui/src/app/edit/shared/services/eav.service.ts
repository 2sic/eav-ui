import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';
import { DialogContext } from '../../../app-administration/models';
import { keyPartOfPage, keyPublishing, partOfPageDefault } from '../../../shared/constants/session.constants';
import { Context } from '../../../shared/services/context';
import { EavFormData, EditSettings, SaveEavFormData } from '../../dialog/main/edit-dialog-main.models';
import { EavConfig, SaveResult, VersioningOptions } from '../models';
import { GlobalConfigService } from '../store/ngrx-data';

export const webApiEditRoot = 'cms/edit/';
export const webApiEntityPicker = 'cms/edit/EntityPicker';

@Injectable()
export class EavService {
  /** WARNING! These are constants that form was loaded with. They do not change while form is running */
  eavConfig: EavConfig;

  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
    private globalConfigService: GlobalConfigService,
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
    settings: EditSettings,
  ) {
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
        sessionStorage.getItem(keyPublishing),
      ),
      formId,
      isParentDialog,
      itemGuids,
      createMode,
      isCopy,
      enableHistory,
      enableFormulaSave: dialogContext.Enable.FormulaSave ?? false,
      overrideEditRestrictions: dialogContext.Enable.OverrideEditRestrictions ?? false,
      dialogContext,
      settings
    };
  }

  fetchFormData(items: string) {
    return this.http.post<EavFormData>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.context.appId.toString() }
    }).pipe(
      map(formData => {
        formData.Context.Language.List = formData.Context.Language.List.filter(language => language.IsEnabled);
        return formData;
      }),
      tap(formData => {
        this.globalConfigService.allowDebug(formData.Context.Enable.DebugMode);
      }),
    );
  }

  saveFormData(result: SaveEavFormData, partOfPage: string) {
    return this.http.post<SaveResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.eavConfig.appId, partOfPage }
    });
  }

  private getVersioningOptions(partOfPage: boolean, publishing: string): VersioningOptions {
    const allowAll: VersioningOptions = { show: true, hide: true, branch: true };
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
