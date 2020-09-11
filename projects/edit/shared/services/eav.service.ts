import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Item } from '../models/eav/item';
import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfig } from '../models/eav-config';
import { FormValueSet, FormDisabledSet } from '../../../edit-types';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { SaveResult } from '../models/eav/save-result.model';
import { EavFormData, EditDialogContext } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { VersioningOptions } from '../models/eav/versioning-options';
import { keyPartOfPage, keyPortalRoot, keyPublishing } from '../../../ng-dialogs/src/app/shared/constants/session.constants';

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
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ui/load'), items, {
      params: { appId: this.context.appId.toString() }
    }) as Observable<EavFormData>;
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

  saveFormData(body: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ui/save'), body, {
      params: { appId: this.eavConfig.appId.toString(), partOfPage: this.eavConfig.partOfPage }
    }) as Observable<SaveResult>;
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
