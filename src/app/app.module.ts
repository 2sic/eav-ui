import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';
import { itemReducer } from './shared/store/reducers';
import { ItemEffects } from './shared/effects/item.effects';
import { EffectsModule } from '@ngrx/effects';
import { EavEntityService } from './shared/services/eav-entity.service';
import { EavItemService } from './shared/services/eav-item.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EavItemDialogModule,
    StoreModule.forRoot({ items: itemReducer }),
    EffectsModule.forRoot([ItemEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    HttpClientModule
  ],
  providers: [EavEntityService, EavItemService],
  bootstrap: [AppComponent]
})
export class AppModule { }
