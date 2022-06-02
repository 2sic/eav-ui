import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModuleConfig } from '@ngx-translate/core';

export function buildTranslateConfiguration(factory: (http: HttpClient) => TranslateLoader): TranslateModuleConfig {
  const config: TranslateModuleConfig = {
    loader: {
      provide: TranslateLoader,
      useFactory: factory,
      deps: [HttpClient],
    },
    defaultLanguage: 'en',
    isolate: true,
  };
  return config;
}
