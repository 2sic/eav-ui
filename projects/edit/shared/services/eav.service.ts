import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { throwError, Observable, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

import { Item } from '../models/eav/item';
import { UrlHelper } from '../helpers/url-helper';
import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfiguration } from '../models/eav-configuration';
import { FormSet } from '../../../edit-types';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { angularConsoleLog } from '../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Injectable()
export class EavService {
  /**
   * Tells subscribed custom components that they should submit their values,
   * e.g. form is going to be saved and we don't want to miss any values.
   * Custom components run outside Angular zone and we have to wait for their values to update.
   */
  forceConnectorSave$$ = new Subject<null>();

  /** formSetValueChangeSource observable is used in external components */
  private formSetValueChangeSource = new Subject<FormSet>();
  formSetValueChange$ = this.formSetValueChangeSource.asObservable();

  private eavConfig: EavConfiguration;

  constructor(private httpClient: HttpClient, private store: Store<fromStore.EavState>, private dnnContext: DnnContext) { }

  getEavConfiguration(): EavConfiguration {
    return this.eavConfig;
  }

  loadAllDataForForm(appId: string, items: string | any) {
    return this.httpClient
      .post(this.dnnContext.$2sxc.http.apiUrl(`eav/ui/load?appId=${appId}`), items)
      .pipe(catchError(error => this.handleError(error))) as Observable<any>;
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
    angularConsoleLog('start submit');
    return this.httpClient.post(this.dnnContext.$2sxc.http.apiUrl(`eav/ui/save?appId=${appId}&partOfPage=${partOfPage}`), body).pipe(
      map((data: any) => {
        angularConsoleLog('return data');
        return data;
      }),
      tap(data => angularConsoleLog('submit: ', data)),
      catchError(error => this.handleError(error)),
    ) as Observable<any>;
  }

  /** Trigger on form change - this is used in external components */
  triggerFormSetValueChange(formSet: FormSet) {
    this.formSetValueChangeSource.next(formSet);
  }

  /** Set Eav Configuration */
  setEavConfiguration(route: ActivatedRoute, context: Context) {
    this.eavConfig = UrlHelper.getEavConfiguration(route, context);
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
