import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { FormDisabledSet, FormValueSet } from '../../../edit-types';
import { keyPartOfPage, keyPortalRoot, keyPublishing } from '../../../ng-dialogs/src/app/shared/constants/session.constants';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { EavFormData, EditDialogContext, SaveEavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { EavConfig } from '../models/eav-config';
import { Item } from '../models/eav/item';
import { SaveResult } from '../models/eav/save-result.model';
import { VersioningOptions } from '../models/eav/versioning-options';
import * as fromStore from '../store';
import * as itemActions from '../store/actions/item.actions';

export const webApiEditRoot = 'cms/edit/';

@Injectable()
export class EavService implements OnDestroy {
  /**
   * Tells subscribed custom components that they should submit their values,
   * e.g. form is going to be saved and we don't want to miss any values.
   * Custom components run outside Angular zone and we have to wait for their values to update.
   */
  forceConnectorSave$ = new Subject<null>();
  /** Temporary solution to circumvent value not being emitted on language change. Fix language change!  */
  formValueChange$ = new Subject<FormValueSet>();
  /** Temporary solution to circumvent disabled not being emitted on language change. Fix language change!  */
  formDisabledChange$ = new Subject<FormDisabledSet>();

  eavConfig: EavConfig;

  constructor(
    private http: HttpClient,
    private store: Store<fromStore.EavState>,
    private dnnContext: DnnContext,
    /** Used to fetch form data and fill up eavConfig. Do not use anywhere else */
    private context: Context,
  ) { }

  // spm TODO: ngOnDestroy only fires in services provided in component
  ngOnDestroy() {
    this.forceConnectorSave$.complete();
    this.formValueChange$.complete();
    this.formDisabledChange$.complete();
  }

  /** Create EavConfiguration from sessionStorage */
  setEavConfig(editDialogContext: EditDialogContext) {
    this.eavConfig = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      appRoot: editDialogContext.App.Url,
      lang: editDialogContext.Language.Current,
      langPri: editDialogContext.Language.Primary,
      langs: editDialogContext.Language.All,
      moduleId: this.context.moduleId.toString(),
      partOfPage: sessionStorage.getItem(keyPartOfPage),
      portalRoot: sessionStorage.getItem(keyPortalRoot),
      tabId: this.context.tabId.toString(),
      systemRoot: window.location.pathname.split('/dist/')[0] + '/',
      versioningOptions: this.getVersioningOptions(
        sessionStorage.getItem(keyPartOfPage) === 'true',
        sessionStorage.getItem(keyPublishing),
      ),
    };
  }

  fetchFormData(items: string) {
    return this.http.post<EavFormData>(this.dnnContext.$2sxc.http.apiUrl(webApiEditRoot + 'load'), items, {
      params: { appId: this.context.appId.toString() }
    });
  }

  saveItem(item: Item) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesAction(item));
  }

  saveItemSuccess(data: SaveResult) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesSuccessAction(data));
  }

  saveItemError(error: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesErrorAction(error));
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
