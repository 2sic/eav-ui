import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor() {
    // constructor(translate: TranslateService) {
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
