import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { throwError, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

@Injectable()
export class EntityService {
  constructor(private httpClient: HttpClient, private translate: TranslateService, private dnnContext: DnnContext) { }

  /**
   * get availableEntities - (used in entity-default input type)
   * @param apiId
   * @param body
   * @param ctName
   */
  getAvailableEntities(apiId: string, body: string, ctName: string) {
    return <Observable<any>>this.httpClient
      .post(this.dnnContext.$2sxc.http.apiUrl('eav/EntityPicker/getavailableentities'), body, {
        params: {
          contentTypeName: ctName,
          appId: apiId,
        },
      })
      .pipe(catchError(error => this.handleError(error)));
  }

  delete(appId: string, type: string, id: string, title: string, tryForce: boolean) {
    if (!confirm(this.translate.instant('Data.Delete.Question', { title: title, id: id }))) {
      return;
    }
    return <Observable<any>>this.httpClient
      .get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/delete'), {
        params: {
          contentType: type,
          id: id,
          appId: appId,
          force: tryForce.toString(),
        },
      })
      .pipe(catchError(error => of(error)));
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
