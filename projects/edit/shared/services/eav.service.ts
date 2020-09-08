import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { SxcRoot } from '@2sic.com/2sxc-typings';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Item } from '../models/eav/item';
import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfig } from '../models/eav-configuration';
import { FormValueSet, FormDisabledSet } from '../../../edit-types';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { SaveResult } from '../models/eav/save-result.model';
import { EavFormData } from '../../eav-item-dialog/multi-item-edit-form/multi-item-edit-form.models';
import { convertUrlToForm } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { VersioningOptions } from '../models/eav/versioning-options';
import { keyDebug, keyDialog, keyLang, keyLangPri, keyLangs, keyMode, keyPartOfPage, keyPortalRoot, keyPublishing, keyWebsiteRoot } from '../../../ng-dialogs/src/app/shared/constants/session.constants';
declare const $2sxc: SxcRoot;

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

  private eavConfig: EavConfig;

  constructor(
    private http: HttpClient,
    private store: Store<fromStore.EavState>,
    private dnnContext: DnnContext,
    private context: Context,
  ) { }

  ngOnDestroy() {
    this.forceConnectorSave$.complete();
    this.formValueChange$.complete();
    this.formDisabledChange$.complete();
  }

  getEavConfig() {
    return this.eavConfig;
  }

  /** Create EavConfiguration from sessionStorage */
  setEavConfig(route: ActivatedRoute) {
    const form = convertUrlToForm(route.snapshot.params.items);
    const editItems = JSON.stringify(form.items);

    this.eavConfig = {
      zoneId: this.context.zoneId.toString(),
      appId: this.context.appId.toString(),
      approot: this.context.appRoot,
      cbid: this.context.contentBlockId.toString(),
      debug: sessionStorage.getItem(keyDebug),
      dialog: sessionStorage.getItem(keyDialog),
      items: editItems,
      lang: sessionStorage.getItem(keyLang),
      langpri: sessionStorage.getItem(keyLangPri),
      langs: sessionStorage.getItem(keyLangs),
      mid: this.context.moduleId.toString(),
      mode: sessionStorage.getItem(keyMode),
      partOfPage: sessionStorage.getItem(keyPartOfPage),
      portalroot: sessionStorage.getItem(keyPortalRoot),
      publishing: sessionStorage.getItem(keyPublishing),
      tid: this.context.tabId.toString(),
      rvt: this.context.requestToken,
      websiteroot: sessionStorage.getItem(keyWebsiteRoot),
      systemroot: ($2sxc.env as any).uiRoot(),
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

  saveFormData(partOfPage: string, body: string) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl('eav/ui/save'), body, {
      params: { appId: this.context.appId.toString(), partOfPage }
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
