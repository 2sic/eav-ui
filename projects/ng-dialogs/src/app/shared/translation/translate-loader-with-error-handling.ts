import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Dictionary } from '../models/dictionary.model';

/**
 * This loader should catch a 404 if the file doesn't exist and not result in errors.
 * https://stackoverflow.com/questions/47391613/how-to-set-a-fallback-assets-i18n-en-json-when-url-is-not-available-ngx-trans
 */
export class TranslateLoaderWithErrorHandling implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string, private suffix: string) { }

  getTranslation(lang: string): Observable<Dictionary> {
    return this.http.get<Dictionary>(`${this.prefix}${lang}${this.suffix}`).pipe(
      catchError(error => {
        console.warn(`Translation: Failed to get language '${lang}' from ${this.prefix}`, error);
        return of({});
      }),
    );
  }
}
