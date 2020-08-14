import { Injectable } from '@angular/core';

import { Context } from './context';
import { EditForm } from '../models/edit-form.model';
import { DialogTypeConstants } from '../constants/dialog-types.constants';
// tslint:disable-next-line:max-line-length
import { keyZoneId, keyAppId, keyTabId, keyModuleId, keyContentBlockId, keyLang, keyLangPri, keyLangs, keyPortalRoot, keyWebsiteRoot, keyPartOfPage, keyAppRoot, keyFa, keyRequestToken, keyDebug, keyUserCanDesign, keyUserCanDevelop, keyUrl, prefix, keyDialog, keyItems, keyPipelineId } from '../constants/session.constants';

@Injectable()
export class DialogService {
  constructor(private context: Context) { }

  openCodeFile(path: string) {
    const dialog = DialogTypeConstants.Develop;
    const form: EditForm = {
      items: [{ Path: path }]
    };
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
      this.buildHashParam(keyAppRoot, this.context.appRoot) +
      this.buildHashParam(keyFa) +
      this.buildHashParam(keyRequestToken) +
      this.buildHashParam(keyDialog, dialog) +
      this.buildHashParam(keyItems, JSON.stringify(form.items)) +
      (sessionStorage.getItem(keyDebug) ? this.buildHashParam(keyDebug) : '') +
      '';

    const url = newHref + newHash;
    window.open(url, '_blank');
  }

  openQueryDesigner(queryId: number) {
    const dialog = DialogTypeConstants.PipelineDesigner;
    const form: EditForm = {
      items: [{ EntityId: queryId.toString() }],
    };
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
      this.buildHashParam(keyAppRoot, this.context.appRoot) +
      this.buildHashParam(keyFa) +
      this.buildHashParam(keyRequestToken) +
      this.buildHashParam(keyDialog, dialog) +
      this.buildHashParam(keyPipelineId, queryId.toString()) +
      this.buildHashParam(keyItems, JSON.stringify(form.items)) +
      (sessionStorage.getItem(keyDebug) ? this.buildHashParam(keyDebug) : '') +
      '';

    const url = newHref + newHash;
    window.open(url, '_blank');
  }

  /** Encodes param if necessary */
  private buildHashParam(key: string, value?: string) {
    const rawKey = key.replace(prefix, '');
    const valueTemp = (value != null) ? value : sessionStorage.getItem(key);
    const rawValue = encodeURIComponent(valueTemp);
    const hashParam = `&${rawKey}=${rawValue}`;
    return hashParam;
  }
}
