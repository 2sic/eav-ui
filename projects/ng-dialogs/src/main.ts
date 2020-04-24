import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // Note: must be output as a log, NOT as warn. Reason is that the console has so many warnings
  // in production related to .map files not found, another warning would simply not be visible.
  window.console.log(`The admin/edit UI has a lot of console.log statements (we know, we\'ll have to work on that).
  In the meantime the production build turns off console.log. So if you need to do your own logging, use console.warn.`);
  window.console.log = () => { };
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
