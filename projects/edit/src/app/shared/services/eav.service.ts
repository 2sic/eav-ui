
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { throwError, Observable, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { Item } from '../models/eav/item';
import { UrlHelper } from '../helpers/url-helper';
import * as itemActions from '../store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfiguration } from '../models/eav-configuration';
import { UrlConstants } from '../constants/url-constants';
import { FormSet } from '../models/eav/form-set';

@Injectable()
export class EavService {
  /**
   * Tells subscribed custom components that they should submit their values,
   * e.g. form is going to be saved and we don't want to miss any values.
   * Custom components run outside Angular zone and we have to wait for their values to update.
   */
  forceConnectorSave$$ = new Subject<null>();
  // this formSetValueChangeSource observable is using in external components
  private formSetValueChangeSource = new Subject<FormSet>();
  formSetValueChange$ = this.formSetValueChangeSource.asObservable();

  private eavConfig: EavConfiguration;

  constructor(
    private httpClient: HttpClient,
    private store: Store<fromStore.EavState>,
    private route: ActivatedRoute,
  ) { }

  public getEavConfiguration = (): EavConfiguration => {
    if (!this.eavConfig) {
      this.setEavConfiguration(this.route);
    }

    if (this.eavConfig) {
      return this.eavConfig;
    } else {
      console.log('Configuration data not set');
    }
  }

  // spm make type for items (name: ItemIndentifier). Do not use as any
  public loadAllDataForForm(appId: string, items: string | any): Observable<any> {
    const body = items; // .replace(/"/g, '\'');
    // TEST
    // const body = JSON.stringify([{ 'EntityId': 3870 }]);
    // const body = JSON.stringify([{ 'EntityId': 1754 }, { 'EntityId': 1785 }]); // , { 'EntityId': 3824 }

    // maybe create model for data
    return this.httpClient.post(`${this.eavConfig.portalroot + UrlConstants.apiRoot}eav/ui/load?appId=${appId}`,
      body)
      .pipe(
        map((data: any) => {
          return data;
        }),
        // tap(data => console.log('getAllDataForForm: ', data)),
        catchError(error => this.handleError(error))
      );
  }
  // TODO: create entityarray type
  // public loadAllDataForFormByEntity(appId: string, entityArray: Array<any>): Observable<any> {
  //   const body = JSON.stringify(entityArray);
  //   // maybe create model for data
  //   return this.httpClient.post(`${UrlConstants.apiRoot}eav/ui/load?appId=${appId}`,
  //     body)
  //     .pipe(
  //       map((data: any) => {
  //         return data;
  //       }),
  //       // tap(data => console.log('getAllDataForForm: ', data)),
  //       catchError(error => this.handleError(error))
  //     );
  // }

  public saveItem(item: Item) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesAction(item));
  }

  public saveItemSuccess(data: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesSuccessAction(data));
  }

  public saveItemError(error: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesErrorAction(error));
  }

  // TODO: Finish return model and sent real body
  // public savemany(appId: number, tabId: string, moduleId: string, contentBlockId: string, body: string): Observable<any> {
  public savemany(appId: string, partOfPage: string, body: string): Observable<any> {
    console.log('start submit');
    // TODO: create model for data
    return this.httpClient.post(`${this.eavConfig.portalroot + UrlConstants.apiRoot}eav/ui/save?appId=${appId}&partOfPage=${partOfPage}`,
      body)
      .pipe(
        map((data: any) => {
          console.log('return data');
          return data;
        }),
        tap(data => console.log('submit: ', data)),
        catchError(error => this.handleError(error))
      );
  }

  /**
  * Trigger on form change - this is using in external components
  */
  public triggerFormSetValueChange(formSet: FormSet) {
    this.formSetValueChangeSource.next(formSet);
  }

  /**
 * Set Eav Configuration
 */
  private setEavConfiguration(route: ActivatedRoute) {
    const queryStringParameters = UrlHelper.readQueryStringParameters(route.snapshot.fragment);
    console.log('queryStringParameters', queryStringParameters);
    // const eavConfiguration: EavConfiguration = UrlHelper.getEavConfiguration(queryStringParameters);
    this.eavConfig = UrlHelper.getEavConfiguration(queryStringParameters);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
