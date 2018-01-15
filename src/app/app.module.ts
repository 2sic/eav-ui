import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { itemReducer } from './shared/reducers';
import { JsonPackage1Service } from './shared/services/json-package1.service';
import { JsonContentType1Service } from './shared/services/json-content-type1.service';
import { JsonItem1Service } from './shared/services/json-item1.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EavItemDialogModule,
    StoreModule.forRoot({ items: itemReducer }),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule
  ],
  providers: [JsonPackage1Service, JsonItem1Service, JsonContentType1Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
