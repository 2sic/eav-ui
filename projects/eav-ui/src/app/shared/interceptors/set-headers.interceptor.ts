import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SetHeadersInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If sending files...
    // Do not set content type so browser can add delimiter boundary automatically
    if (req.body instanceof FormData)
      return next.handle(req);

    // Standard case: Make sure the server knows we want JSON
    const reqWithJsonContentType = req.clone({
      setHeaders: {
        'Content-Type': 'application/json;charset=UTF-8',
      }
    });
    return next.handle(reqWithJsonContentType);
  }
}
