import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export function buildTranslateConfiguration(factory: (http: HttpClient) => TranslateLoader) {
  return {
    loader: {
      provide: TranslateLoader,
      useFactory: factory,
      deps: [HttpClient],
    },
    defaultLanguage: 'en',
    isolate: true,
  };
}
