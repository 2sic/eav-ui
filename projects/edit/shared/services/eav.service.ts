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
import { FormSet } from '../models/eav/form-set';
import { Context } from '../../../ng-dialogs/src/app/shared/context/context';

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

  constructor(
    private httpClient: HttpClient,
    private store: Store<fromStore.EavState>,
    private dnnContext: DnnContext,
  ) { }

  getEavConfiguration(): EavConfiguration {
    return this.eavConfig;
  }

  loadAllDataForForm(appId: string, items: string | any) {
    return <Observable<any>>(
      this.httpClient
        .post(this.dnnContext.$2sxc.http.apiUrl(`eav/ui/load?appId=${appId}`), items)
        .pipe(catchError(error => this.handleError(error)))
    );
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
    console.log('start submit');
    return <Observable<any>>(
      this.httpClient.post(this.dnnContext.$2sxc.http.apiUrl(`eav/ui/save?appId=${appId}&partOfPage=${partOfPage}`), body).pipe(
        map((data: any) => {
          console.log('return data');
          return data;
        }),
        tap(data => console.log('submit: ', data)),
        catchError(error => this.handleError(error)),
      )
    );
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
