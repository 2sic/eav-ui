import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Item } from '../models/eav/item';
import { UrlHelper } from '../helpers/url-helper';
import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfig } from '../models/eav-configuration';
import { FormValueSet, FormDisabledSet } from '../../../edit-types';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { SaveResult } from '../models/eav/save-result.model';

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

  constructor(private http: HttpClient, private store: Store<fromStore.EavState>, private dnnContext: DnnContext) { }

  ngOnDestroy() {
    this.forceConnectorSave$.complete();
    this.formValueChange$.complete();
    this.formDisabledChange$.complete();
  }

  getEavConfig() {
    return this.eavConfig;
  }

  setEavConfiguration(route: ActivatedRoute, context: Context) {
    this.eavConfig = UrlHelper.getEavConfiguration(route, context);
  }

  loadAllDataForForm(appId: string, items: string | any) {
    return this.http.post(this.dnnContext.$2sxc.http.apiUrl(`eav/ui/load?appId=${appId}`), items) as Observable<any>;
  }

  saveItem(item: Item) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesAction(item));
  }

  saveItemSuccess(data: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesSuccessAction(data));
  }

  saveItemError(error: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesErrorAction(error));
  }

  savemany(appId: string, partOfPage: string, body: string) {
    return this.http.post(
      this.dnnContext.$2sxc.http.apiUrl(`eav/ui/save?appId=${appId}&partOfPage=${partOfPage}`),
      body
    ) as Observable<SaveResult>;
  }
}
