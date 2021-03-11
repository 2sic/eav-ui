import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

const LoadTimeoutMs = 2000;

/**
 * This loader should catch a 404 if the file doesn't exist and not result in errors.
 * https://stackoverflow.com/questions/47391613/how-to-set-a-fallback-assets-i18n-en-json-when-url-is-not-available-ngx-trans
 */
export class TranslateLoaderWithErrorHandling implements TranslateLoader {
  constructor(private http: HttpClient, public prefix: string, public suffix: string) { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`).pipe(
      timeout(LoadTimeoutMs),
      catchError(error => {
        console.warn(`Translation: Failed to get language '${lang}' from ${this.prefix}`, error);
        return of({});
      })
    );
  }
}
