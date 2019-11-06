import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AdminRootComponent } from './admin-root/admin-root.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AdminEavService } from './services/admin-eav.service';

const appRoutes: Routes = [
  {
    path: 'app',
    component: AdminRootComponent
  }
];

export function adminEavServiceFactory(injector: Injector, adminEavService: AdminEavService): Function {
  return function () {
    console.log('Setting admin eav config and clearing route');
    if (!window.location.hash.startsWith('#/app')) {
      adminEavService.setEavConfiguration(window.location.hash);
    }
    const router = injector.get(Router);
    router.navigate(['/app']);
    return;
  };
}

@NgModule({
  declarations: [
    AppComponent,
    AdminRootComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule
  ],
  providers: [
    AdminEavService,
    { provide: APP_INITIALIZER, useFactory: adminEavServiceFactory, deps: [Injector, AdminEavService], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
