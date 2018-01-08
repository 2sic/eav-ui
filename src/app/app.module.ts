import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EavItemDialogModule } from './eav-item-dialog/eav-item-dialog.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    EavItemDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
