import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

import { Item } from '../models/eav/item';
import { ItemService } from './item.service';
import { ContentTypeService } from './content-type.service';
import { UrlHelper } from '../helpers/url-helper';
import * as itemActions from '../../shared/store/actions/item.actions';
// import * as eavActions from '../../shared/store/actions/eav.actions';
import * as fromStore from '../store';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class EavService {

  // public items$  Observable<Item[]>;

  // this formSetValueChangeSource observable is using in external components
  private formSetValueChangeSource = new Subject<{ [name: string]: any }>();
  formSetValueChange$ = this.formSetValueChangeSource.asObservable();

  constructor(private httpClient: HttpClient,
    private store: Store<fromStore.EavState>,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService) {
  }

  // public getAllData() {
  //   this.store.dispatch(new dataActions.LoadAllDataAction());
  // }

  public loadAllDataForForm(appId: string, tabId: string, moduleId: string, contentBlockId: string, items: string): Observable<any> {
    console.log('call getAllDataForForm', items);

    const body = JSON.stringify([{ 'EntityId': 1754 }, { 'EntityId': 1785 }]);
    // const body = JSON.stringify([{ 'EntityId': 1034 }, { 'EntityId': 1035 }]);
    //  const body = items;
    const header = UrlHelper.createHeader(tabId, moduleId, contentBlockId);
    console.log('body', body);
    console.log('headers', header);
    // maybe create model for data
    return this.httpClient.post(`/desktopmodules/2sxc/api/eav/ui/load?appId=${appId}`,
      body, { headers: header })
      .map((data: any) => {
        return data;
      })
      // .do(data => console.log('getAllDataForForm: ', data))
      .catch(this.handleError);
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
  public savemany(appId: number, tabId: string, moduleId: string, contentBlockId: string, body: string): Observable<any> {
    console.log('start submit');
    // tslint:disable-next-line:max-line-length
    // const bodyTemp = `[{"Header":{"EntityId":1722,"Guid":"07621ab2-4bdc-4fd2-9c9d-e9cc765f988c","ContentTypeName":"67a0b738-f1d0-4773-899d-c5bb04cfce2b","Metadata":null,"Group":null,"Prefill":null,"Title":null,"DuplicateEntity":null},"Entity":{"Id":1722,"Type":{"Name":"DirectoryItem","StaticName":"67a0b738-f1d0-4773-899d-c5bb04cfce2b"},"IsPublished":true,"IsBranch":false,"TitleAttributeName":"Title","Attributes":{"Title":{"Values":[{"Value":"2sic internet solutions","Dimensions":{"en-us":false}}]},"Industry":{"Values":[{"Value":["9e733bf4-8179-4add-a333-6cb6dbff38dc"],"Dimensions":{}}]},"Link":{"Values":[{"Value":"https://www.2sic.com","Dimensions":{"en-us":false}}]},"Logo":{"Values":[{"Value":"file:216","Dimensions":{"en-us":false}}]},"LinkText":{"Values":[{"Value":"www.2sic.com","Dimensions":{"en-us":false}}]},"Town":{"Values":[{"Value":"Buchs","Dimensions":{"en-us":false}}]},"localizationMenus":[{"all":{}},{"all":{}},{"all":{}},{"all":{}},{"all":{}}]},"AppId":15},"slotIsUsed":true}]`;

    //  const body = items;
    // const header = UrlHelper.createHeader('55', '419', '419');
    const header = UrlHelper.createHeader(tabId, moduleId, contentBlockId);
    const partOfPage = false;

    // TODO: create model for data
    return this.httpClient.post(
      `/desktopmodules/2sxc/api/eav/ui/save?appId=${appId}&partOfPage=${partOfPage}`,
      body,
      { headers: header })
      .map((data: any) => {
        console.log('return data');
        return data;
      })
      .do(data => console.log('submit: ', data))
      .catch(this.handleError);
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
    return Observable.throw(errMsg);
  }
}
