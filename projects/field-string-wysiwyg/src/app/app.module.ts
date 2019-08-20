import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { EditorModule } from '@tinymce/tinymce-angular';

import { AppComponent } from './app.component';
import { TinymceWysiwygComponent } from './tinymce-wysiwyg/tinymce-wysiwyg.component';
import { TinymceWysiwygConfig } from './services/tinymce-wysiwyg-config';
import { TinyMceDnnBridgeService } from './services/tinymce-dnnbridge-service';
import { TinyMceAdamService } from './services/tinymce-adam-service';

@NgModule({
  declarations: [
    AppComponent,
    TinymceWysiwygComponent
  ],
  imports: [
    BrowserModule,
    EditorModule,
    HttpClientModule,
  ],
  providers: [
    TinymceWysiwygConfig,
    TinyMceDnnBridgeService,
    TinyMceAdamService,
  ],
  entryComponents: [AppComponent, TinymceWysiwygComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    if (!customElements.get('field-string-wysiwyg')) {
      const wysiwyg = createCustomElement(TinymceWysiwygComponent, { injector });
      const wysiwygAdv = createCustomElement(TinymceWysiwygComponent, { injector });
      const wysiwygDnn = createCustomElement(TinymceWysiwygComponent, { injector });
      const wysiwygTinymce = createCustomElement(TinymceWysiwygComponent, { injector });

      customElements.define('field-string-wysiwyg', wysiwyg);
      customElements.define('field-string-wysiwyg-adv', wysiwygAdv);
      customElements.define('field-string-wysiwyg-dnn', wysiwygDnn);
      customElements.define('field-string-wysiwyg-tinymce', wysiwygTinymce);
    }
  }
  ngDoBootstrap() { }
}
