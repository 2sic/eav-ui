import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Context } from '../context/context';

@Injectable()
export class HttpHeaderInterceptor implements HttpInterceptor {
  constructor(
    private context: Context,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let modified: HttpRequest<any>;
    if (req.body instanceof FormData) {
      // sending files. Do not set content type so browser can add delimiter boundary automatically
      modified = req.clone({
        setHeaders: {
          'TabId': this.context.tabId.toString(),
          'ContentBlockId': this.context.contentBlockId.toString(),
          'ModuleId': this.context.moduleId.toString(),
          'RequestVerificationToken': this.context.requestToken,
        }
      });
    } else {
      modified = req.clone({
        setHeaders: {
          'TabId': this.context.tabId.toString(),
          'ContentBlockId': this.context.contentBlockId.toString(),
          'ModuleId': this.context.moduleId.toString(),
          'Content-Type': 'application/json;charset=UTF-8',
          'RequestVerificationToken': this.context.requestToken,
        }
      });
    }
    return next.handle(modified);
  }
}
