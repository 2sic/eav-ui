import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(`/`);
  }

  getParagraphText() {
    return element(by.css('app-multi-item-edit-form h1')).getText();
  }
}
