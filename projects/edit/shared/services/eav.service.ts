import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FormDisabledSet, FormValueSet } from '../../../edit-types';
import { keyPartOfPage, keyPublishing } from '../../../ng-dialogs/src/app/shared/constants/session.constants';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { EavFormData, EditDialogContext, SaveEavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { EavConfig, SaveResult, VersioningOptions } from '../models';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class EavService implements OnDestroy {
  /** Temporary solution to circumvent value not being emitted on language change. Fix language change!  */
  formValueChange$ = new Subject<FormValueSet>();
  /** Temporary solution to circumvent disabled not being emitted on language change. Fix language change!  */
  formDisabledChange$ = new Subject<FormDisabledSet>();

  /** WARNING! These are constants that form was loaded with. They do not change while form is running */
  eavConfig: EavConfig;

  constructor(
    private http: HttpClient,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
  ) { }

  // spm TODO: ngOnDestroy only fires in services provided in component
  ngOnDestroy() {
    this.formValueChange$.complete();
    this.formDisabledChange$.complete();
  }

  /** Create EavConfiguration from sessionStorage */
  setEavConfig(
    editDialogContext: EditDialogContext,
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
      appRoot: editDialogContext.App.Url,
      lang: editDialogContext.Language.Current,
      langPri: editDialogContext.Language.Primary,
      langs: editDialogContext.Language.All,
      moduleId: this.context.moduleId.toString(),
      partOfPage: sessionStorage.getItem(keyPartOfPage),
      portalRoot: editDialogContext.Site.Url,
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
    };
  }

  fetchFormData(items: string) {
    return this.http.post<EavFormData>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.context.appId.toString() }
    });
  }

  saveFormData(result: SaveEavFormData) {
    return this.http.post<SaveResult>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'save'), result, {
      params: { appId: this.eavConfig.appId.toString(), partOfPage: this.eavConfig.partOfPage }
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
