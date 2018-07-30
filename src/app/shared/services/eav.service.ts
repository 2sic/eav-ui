
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { throwError as observableThrowError, Observable, Subject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { Item } from '../models/eav/item';
import { ItemService } from './item.service';
import { ContentTypeService } from './content-type.service';
import { UrlHelper } from '../helpers/url-helper';
import * as itemActions from '../../shared/store/actions/item.actions';
import * as fromStore from '../store';
import { EavConfiguration } from '../models/eav-configuration';


@Injectable()
export class EavService {

  // this formSetValueChangeSource observable is using in external components
  private formSetValueChangeSource = new Subject<{ [name: string]: any }>();
  formSetValueChange$ = this.formSetValueChangeSource.asObservable();

  private eavConfig: EavConfiguration;

  constructor(private httpClient: HttpClient,
    private store: Store<fromStore.EavState>,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService) {
  }

  // public getAllData() {
  //   this.store.dispatch(new dataActions.LoadAllDataAction());
  // }

  public getEavConfiguration = (): EavConfiguration => {
    if (this.eavConfig) {
      return this.eavConfig;
    } else {
      console.log('Configuration data not set');
    }
  }

  public loadAllDataForForm(eavConfig: EavConfiguration): Observable<any> {
    const body = JSON.stringify([{ 'EntityId': 3830 }]);
    // const body = JSON.stringify([{ 'EntityId': 1754 }, { 'EntityId': 1785 }]); // , { 'EntityId': 3824 }
    // const body = JSON.stringify([{ 'EntityId': 1034 }, { 'EntityId': 1035 }]);
    //  const body = items;
    const header = UrlHelper.createHeader(eavConfig.tid, eavConfig.mid, eavConfig.cbid);
    console.log('body', body);
    console.log('headers', header);
    // maybe create model for data
    return this.httpClient.post(`/desktopmodules/2sxc/api/eav/ui/load?appId=${eavConfig.appId}`,
      body, { headers: header })
      .pipe(
        map((data: any) => {
          return data;
        }),
        // tap(data => console.log('getAllDataForForm: ', data)),
        catchError(error => this.handleError(error))
      );
  }

  public saveItem(appId: number, item: Item, updateValues: { [key: string]: any }, existingLanguageKey: string, defaultLanguage: string) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesAction(appId, item, updateValues, existingLanguageKey, defaultLanguage));
  }

  public saveItemSuccess(data: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesSuccessAction(data));
  }

  public saveItemError(error: any) {
    this.store.dispatch(new itemActions.SaveItemAttributesValuesErrorAction(error));
  }

  // TODO: Finish return model and sent real body
  // public savemany(appId: number, tabId: string, moduleId: string, contentBlockId: string, body: string): Observable<any> {
  public savemany(eavConfiguration: EavConfiguration, body: string): Observable<any> {
    console.log('start submit');
    // tslint:disable-next-line:max-line-length
    // const bodyTemp = `[{"Header":{"EntityId":1722,"Guid":"07621ab2-4bdc-4fd2-9c9d-e9cc765f988c","ContentTypeName":"67a0b738-f1d0-4773-899d-c5bb04cfce2b","Metadata":null,"Group":null,"Prefill":null,"Title":null,"DuplicateEntity":null},"Entity":{"Id":1722,"Type":{"Name":"DirectoryItem","StaticName":"67a0b738-f1d0-4773-899d-c5bb04cfce2b"},"IsPublished":true,"IsBranch":false,"TitleAttributeName":"Title","Attributes":{"Title":{"Values":[{"Value":"2sic internet solutions","Dimensions":{"en-us":false}}]},"Industry":{"Values":[{"Value":["9e733bf4-8179-4add-a333-6cb6dbff38dc"],"Dimensions":{}}]},"Link":{"Values":[{"Value":"https://www.2sic.com","Dimensions":{"en-us":false}}]},"Logo":{"Values":[{"Value":"file:216","Dimensions":{"en-us":false}}]},"LinkText":{"Values":[{"Value":"www.2sic.com","Dimensions":{"en-us":false}}]},"Town":{"Values":[{"Value":"Buchs","Dimensions":{"en-us":false}}]},"localizationMenus":[{"all":{}},{"all":{}},{"all":{}},{"all":{}},{"all":{}}]},"AppId":15},"slotIsUsed":true}]`;

    //  const body = items;
    // const header = UrlHelper.createHeader('55', '419', '419');
    const header = UrlHelper.createHeader(eavConfiguration.tid, eavConfiguration.mid, eavConfiguration.cbid);

    // const partOfPage = false;

    // TODO: create model for data
    return this.httpClient.post(
      `/desktopmodules/2sxc/api/eav/ui/save?appId=${eavConfiguration.appId}&partOfPage=${eavConfiguration.partOfPage}`,
      body,
      { headers: header })
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
 * Set Eav Configuration
 */
  public setEavConfiguration(route) {
    const queryStringParameters = UrlHelper.readQueryStringParameters(route.snapshot.fragment);
    console.log('queryStringParameters', queryStringParameters);
    // const eavConfiguration: EavConfiguration = UrlHelper.getEavConfiguration(queryStringParameters);
    this.eavConfig = UrlHelper.getEavConfiguration(queryStringParameters);
  }

  /**
  * Trigger on form change - this is using in external components
  */
  public triggerFormSetValueChange(formValues: { [name: string]: any }) {
    this.formSetValueChangeSource.next(formValues);
  }

  private handleError(error: any) {
    // In a real world app, we might send the error to remote logging infrastructure
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return observableThrowError(errMsg);
  }
}
