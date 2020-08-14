import { ActivatedRoute } from '@angular/router';

import { EavConfiguration } from '../models/eav-configuration';
import { VersioningOptions } from '../models/eav/versioning-options';
// tslint:disable-next-line:max-line-length
import { keyDebug, keyDialog, keyLang, keyLangPri, keyLangs, keyMode, keyPartOfPage, keyPortalRoot, keyPublishing, keyWebsiteRoot } from '../../../ng-dialogs/src/app/shared/constants/session.constants';
import { Context } from '../../../ng-dialogs/src/app/shared/services/context';
import { EditForm } from '../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { paramDecode } from '../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';

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
    return new EavConfiguration(
      context.zoneId.toString(),
      context.appId.toString(),
      context.appRoot,
      context.contentBlockId.toString(),
      sessionStorage.getItem(keyDebug),
      sessionStorage.getItem(keyDialog),
      this.calculateItems(route.snapshot.params.items),
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

  private static calculateItems(routeItems: string) {
    let items: string;
    const isNumber = /^[0-9]*$/g;
    const itemIsId = isNumber.test(routeItems);
    if (itemIsId) {
      items = `[{"EntityId":${routeItems}}]`;
    } else {
      const editFormData: EditForm = JSON.parse(paramDecode(routeItems));
      items = JSON.stringify(editFormData.items);
    }
    return items;
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

  /** https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters/1099670#1099670 */
  static getUrlParams(qs: string) {
    qs = qs.split('+').join(' ');

    const params: { [key: string]: string } = {};
    let tokens;
    const re = /[?&]?([^=]+)=([^&]*)/g;

    // tslint:disable-next-line:no-conditional-assignment
    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
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
