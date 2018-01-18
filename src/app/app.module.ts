import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';

import { EffectsModule } from '@ngrx/effects';
import { EavEntityService } from './shared/services/eav-entity.service';
import { ItemService } from './shared/services/item.service';
import { ContentTypeService } from './shared/services/content-type.service';
import { itemReducer, contentTypeReducer } from './shared/store/reducers';
import { ItemEffects } from './shared/effects/item.effects';
import { ContentTypeEffects } from './shared/effects/content-type.effects';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EavItemDialogModule,
    StoreModule.forRoot({ items: itemReducer, contentTypes: contentTypeReducer }),
    EffectsModule.forRoot([ItemEffects, ContentTypeEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule
  ],
  providers: [EavEntityService, ItemService, ContentTypeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
