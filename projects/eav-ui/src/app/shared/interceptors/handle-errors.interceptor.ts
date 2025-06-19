import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export const IGNORED_STATUSES = new HttpContextToken<number[]>(() => []);

@Injectable()
export class HandleErrorsInterceptor implements HttpInterceptor {
  /** URLs excluded from detailed error alert  */
  private excludedUrls = [
    'dist/ng-edit/i18n',
  ];

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const ignoredStatuses = req.context.get(IGNORED_STATUSES);
    return next.handle(req).pipe(

      catchError((error: HttpErrorResponse) => {

        // If Status is in the ignored list, just use the error custom im component (example: content-items.component 400 Error Deleting Item)
        if (ignoredStatuses?.includes(error.status)) {
          return throwError(() => error);
        }

        if (!this.checkIfExcluded(error.url)) {
          this.showDetailedHttpError(error);
        }
        return throwError(error);
      })
    );
  }

  private checkIfExcluded(url: string) {
    for (const excludedUrl of this.excludedUrls) {
      if (url.includes(excludedUrl)) {
        return true;
      }
    }
    return false;
  }

  private showDetailedHttpError(error: HttpErrorResponse) {
    let infoText = 'Had an error talking to the server (status ' + error.status + ').';
    const srvResp = error.error;
    if (srvResp) {
      const msg = srvResp.Message;
      if (msg)
        infoText += '\nMessage: ' + msg;
      const msgDet = srvResp.MessageDetail || srvResp.ExceptionMessage;
      if (msgDet)
        infoText += '\nDetail: ' + msgDet;

      if (msgDet && msgDet.indexOf('No action was found') === 0) {
        if (msgDet.indexOf('that matches the name') > 0)
          infoText += '\n\nTip from 2sxc: you probably got the action-name wrong in your JS.';
        else if (msgDet.indexOf('that matches the request.') > 0)
          infoText += '\n\nTip from 2sxc: Seems like the parameters are the wrong amount or type.';
      }

      if (msg && msg.indexOf('Controller') === 0 && msg.indexOf('not found') > 0) {
        infoText += '\n\nTip from 2sxc: you probably spelled the controller name wrong or forgot to remove the word \'controller\' from the call in JS. To call a controller called \'DemoController\' only use \'Demo\'.';
      }
      infoText += '\n\nif you are an advanced user you can learn more about what went wrong - discover how on 2sxc.org/help?tag=debug';
    }

    alert(infoText);
  }
}
