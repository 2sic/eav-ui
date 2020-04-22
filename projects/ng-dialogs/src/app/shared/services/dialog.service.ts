import { Injectable } from '@angular/core';

import { Context } from './context';
import { EditForm } from '../../app-administration/shared/models/edit-form.model';
// tslint:disable-next-line:max-line-length
import { keyZoneId, keyAppId, keyTabId, keyModuleId, keyContentBlockId, keyLang, keyLangPri, keyLangs, keyPortalRoot, keyWebsiteRoot, keyPartOfPage, keyAppRoot, keyFa, keyRequestToken, keyDebug, keyUserCanDesign, keyUserCanDevelop, keyUrl, prefix, keyDialog, keyItems } from '../constants/sessions-keys';

@Injectable()
export class DialogService {
  constructor(private context: Context) { }

  openCode(form: EditForm) {
    const dialog = 'develop';
    const oldHref = sessionStorage.getItem(keyUrl);
    const oldUrl = new URL(oldHref);
    const newHref = oldUrl.origin + oldUrl.pathname + oldUrl.search;
    const newHash =
      this.buildHashParam(keyZoneId, this.context.zoneId.toString()).replace('&', '#') +
      this.buildHashParam(keyAppId, this.context.appId.toString()) +
      this.buildHashParam(keyTabId, this.context.tabId.toString()) +
      this.buildHashParam(keyModuleId, this.context.moduleId.toString()) +
      this.buildHashParam(keyContentBlockId, this.context.contentBlockId.toString()) +
      this.buildHashParam(keyLang) +
      this.buildHashParam(keyLangPri) +
      this.buildHashParam(keyLangs) +
      this.buildHashParam(keyPortalRoot) +
      this.buildHashParam(keyWebsiteRoot) +
      this.buildHashParam(keyPartOfPage) +
      this.buildHashParam(keyUserCanDesign) +
      this.buildHashParam(keyUserCanDevelop) +
      this.buildHashParam(keyAppRoot) +
      this.buildHashParam(keyFa) +
      this.buildHashParam(keyRequestToken) +
      this.buildHashParam(keyDialog, dialog) +
      this.buildHashParam(keyItems, JSON.stringify(form.items)) +
      (sessionStorage.getItem(keyDebug) ? this.buildHashParam(keyDebug) : '') +
      '';

    const url = newHref + newHash;
    window.open(url, '_blank');
  }

  private buildHashParam(key: string, value?: string) {
    const rawKey = key.replace(prefix, '');
    const valueTemp = (value !== undefined) ? value : sessionStorage.getItem(key);
    const rawValue = encodeURIComponent(valueTemp);
    const hashParam = `&${rawKey}=${rawValue}`;
    return hashParam;
  }
}
