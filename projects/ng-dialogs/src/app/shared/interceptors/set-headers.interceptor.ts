import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SetHeadersInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let modified: HttpRequest<any>;
    if (req.body instanceof FormData) {
      // sending files. Do not set content type so browser can add delimiter boundary automatically
      return next.handle(req);
    } else {
      modified = req.clone({
        setHeaders: {
          'Content-Type': 'application/json;charset=UTF-8',
        }
      });
      return next.handle(modified);
    }
  }
}
