import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { throwError, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Context as DnnContext } from '@2sic.com/dnn-sxc-angular';

@Injectable()
export class EntityService {
  constructor(private httpClient: HttpClient, private translate: TranslateService, private dnnContext: DnnContext) { }

  /** (used in entity-default input type) */
  getAvailableEntities(apiId: string, body: string, ctName: string) {
    return this.httpClient
      .post(this.dnnContext.$2sxc.http.apiUrl('eav/EntityPicker/getavailableentities'), body, {
        params: {
          contentTypeName: ctName,
          appId: apiId,
        },
      })
      .pipe(catchError(error => this.handleError(error))) as Observable<any>;
  }

  delete(appId: string, type: string, id: string, title: string, tryForce: boolean) {
    if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }

    return this.httpClient
      .get(this.dnnContext.$2sxc.http.apiUrl('eav/entities/delete'), {
        params: {
          contentType: type,
          id,
          appId,
          force: tryForce.toString(),
        },
      })
      .pipe(catchError(error => of(error))) as Observable<any>;
  }

  private handleError(error: Error) {
    const errMsg = error.message || 'Server error';
    console.error(errMsg);
    return throwError(errMsg);
  }
}
