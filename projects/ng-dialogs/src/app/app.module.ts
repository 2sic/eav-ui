import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AdminDialogRootComponent } from './admin-dialog-root/admin-dialog-root.component';
import { AdminEavService } from './services/admin-eav.service';
import { HomeComponent } from './home/home.component';
import { DataComponent } from './data/data.component';

const appRoutes: Routes = [
  { path: 'app', redirectTo: 'app/home', pathMatch: 'full' },
  { path: 'app/home', component: HomeComponent },
  { path: 'app/data', component: DataComponent }
];

export function adminEavServiceFactory(injector: Injector, adminEavService: AdminEavService): Function {
  return function () {
    console.log('Setting admin eav config and clearing route');
    if (!window.location.hash.startsWith('#/app')) {
      adminEavService.setEavConfiguration(window.location.hash);
    }
    const router = injector.get(Router);
    router.navigate(['/app']);
  };
}

@NgModule({
  declarations: [
    AppComponent,
    AdminDialogRootComponent,
    HomeComponent,
    DataComponent
  ],
  entryComponents: [
    AdminDialogRootComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    MatDialogModule,
    BrowserAnimationsModule
  ],
  providers: [
    AdminEavService,
    { provide: APP_INITIALIZER, useFactory: adminEavServiceFactory, deps: [Injector, AdminEavService], multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
