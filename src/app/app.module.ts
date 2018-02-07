import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule, Store } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { FormlyModule } from '@ngx-formly/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyMaterialModule, FormlyWrapperFormField, FormlyFieldInput } from '@ngx-formly/material';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { itemReducer, contentTypeReducer } from './shared/store/reducers';
import { ItemEffects } from './shared/effects/item.effects';
import { ContentTypeEffects } from './shared/effects/content-type.effects';
import { EavFormlyMaterialModule } from './eav-formly-material/eav-formly-material.module';


const routes: Routes = [
  {
    path: 'eav-item-dialog',
    loadChildren: 'app/eav-item-dialog/eav-item-dialog.module#EavItemDialogModule'
  },
  {
    path: '',
    redirectTo: '',
    // redirectTo: 'eav-item-dialog',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ items: itemReducer, contentTypes: contentTypeReducer }),
    EffectsModule.forRoot([ItemEffects, ContentTypeEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FormlyMaterialModule,
    EavFormlyMaterialModule,
    FormlyModule
  ],
  exports: [RouterModule],
  providers: [ItemService, ContentTypeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
