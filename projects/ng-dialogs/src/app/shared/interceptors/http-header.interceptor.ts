import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { QueryParameters } from '../models/query-parameters.model';

@Injectable()
export class HttpHeaderInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const queryParameters = new QueryParameters();
    Object.keys(queryParameters).forEach(key => {
      if (queryParameters.hasOwnProperty(key)) {
        queryParameters[key] = sessionStorage.getItem(key);
      }
    });
    debugger;
    const modified = req.clone({
      setHeaders: {
        'TabId': queryParameters.tid,
        'ContentBlockId': queryParameters.cbid,
        'ModuleId': queryParameters.mid,
        'Content-Type': 'application/json;charset=UTF-8',
        'RequestVerificationToken': queryParameters.rvt
      }
    });
    return next.handle(modified);
  }
}
