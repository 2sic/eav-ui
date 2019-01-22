import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  entryComponents: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(AppComponent, { injector });
    if (customElements.get('wysiwyg-webcomponent')) {
      console.log('postoji', customElements.get('wysiwyg-webcomponent'));
    }
    // try {
    customElements.define('wysiwyg-webcomponent', el);
    // } catch (error) {
    //   console.log('error:', error);
    // }
  }
  ngDoBootstrap() { }
}

