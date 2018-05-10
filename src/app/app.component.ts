import { Component, ElementRef } from '@angular/core';
import { DnnAppComponent, Context } from '@2sic.com/dnn-sxc-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(translate: TranslateService) {
    // // this language will be used as a fallback when a translation isn't found in the current language
    // translate.setDefaultLang('en');

    // // the lang to use, if the lang isn't available, it will use the current loader to get them
    // translate.use('en');
    // this language will be used as a fallback when a translation isn't found in the current language
    // translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    // translate.use('en');
    // translate.use('fr');
  }
}
