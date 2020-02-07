import { ActivatedRoute } from '@angular/router';

import { EavConfiguration } from '../models/eav-configuration';
import { VersioningOptions } from '../models/eav/versioning-options';
// tslint:disable-next-line:max-line-length
import { keyAppRoot, keyDebug, keyDialog, keyLang, keyLangPri, keyLangs, keyMode, keyPartOfPage, keyPortalRoot, keyPublishing, keyWebsiteRoot } from '../../../ng-dialogs/src/app/shared/constants/sessions-keys';
import { Context } from '../../../ng-dialogs/src/app/shared/context/context';

export class UrlHelper {

  static readQueryStringParameters(url: string): { [key: string]: string } {
    const queryParams: { [key: string]: string } = {};
    url.split('&').forEach(f => {
      if (f.split('=').length === 2) {
        queryParams[f.split('=')[0]] = decodeURIComponent(f.split('=')[1].replace(/\+/g, ' '));
      }
    });
    return queryParams;
  }

  /** Create EavConfiguration from sessionStorage */
  static getEavConfiguration(route: ActivatedRoute, context: Context) {
    const editFormData = JSON.parse(decodeURIComponent(route.snapshot.params.items));
    return new EavConfiguration(
      context.zoneId.toString(),
      context.appId.toString(),
      sessionStorage.getItem(keyAppRoot),
      context.contentBlockId.toString(),
      sessionStorage.getItem(keyDebug),
      sessionStorage.getItem(keyDialog),
      editFormData.addItems ? editFormData.addItems as any : JSON.stringify(editFormData.editItems),
      sessionStorage.getItem(keyLang),
      sessionStorage.getItem(keyLangPri),
      sessionStorage.getItem(keyLangs),
      context.moduleId.toString(),
      sessionStorage.getItem(keyMode),
      sessionStorage.getItem(keyPartOfPage),
      sessionStorage.getItem(keyPortalRoot),
      sessionStorage.getItem(keyPublishing),
      context.tabId.toString(),
      context.requestToken.toString(),
      sessionStorage.getItem(keyWebsiteRoot),
      UrlHelper.getVersioningOptions(sessionStorage.getItem(keyPartOfPage) === 'true', sessionStorage.getItem(keyPublishing))
    );
  }

  private static getVersioningOptions(partOfPage: boolean, publishing: string): VersioningOptions {
    if (!partOfPage) { return { show: true, hide: true, branch: true }; }

    const req = publishing || '';
    switch (req) {
      case '':
      case 'DraftOptional': return { show: true, hide: true, branch: true };
      case 'DraftRequired': return { branch: true, hide: true };
      default: {
        console.error('invalid versioning requiremenets: ' + req.toString());
        return {};
      }
    }
  }

  static replaceUrlParam(url: string, paramName: string, paramValue: string) {
    if (paramValue === null) { paramValue = ''; }

    const pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) { return url.replace(pattern, '$1' + paramValue + '$2'); }

    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
  }

  static getUrlPrefix(area: string, eavConfig: EavConfiguration) {
    let result = '';

    if (area === 'system') { result = eavConfig.systemroot; }                    // used to link to JS-stuff and similar
    if (area === 'zone') { result = eavConfig.portalroot; }                      // used to link to the site-root (like an image)
    if (area === 'app') { result = eavConfig.approot; }                          // used to find the app-root of something inside an app
    if (result.endsWith('/')) { result = result.substring(0, result.length - 1); }

    return result;
  }
}
