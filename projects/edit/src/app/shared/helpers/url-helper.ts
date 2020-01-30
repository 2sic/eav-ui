import { EavConfiguration } from '../models/eav-configuration';
import { VersioningOptions } from '../models/eav/versioning-options';
import { readFromSession } from '../../../../../ng-dialogs/src/app/shared/helpers/session-storage.helper';

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
  static getEavConfiguration() {
    return new EavConfiguration(
      readFromSession('zoneId'),
      readFromSession('appId'),
      readFromSession('approot'),
      readFromSession('cbid'),
      readFromSession('debug'),
      readFromSession('dialog'),
      readFromSession('items'),
      readFromSession('lang'),
      readFromSession('langpri'),
      readFromSession('langs'),
      readFromSession('mid'),
      readFromSession('mode'),
      readFromSession('partOfPage'),
      readFromSession('portalroot'),
      readFromSession('publishing'),
      readFromSession('tid'),
      readFromSession('rvt'),
      readFromSession('websiteroot'),
      UrlHelper.getVersioningOptions(readFromSession('partOfPage') === 'true', readFromSession('publishing'))
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
    if (area === 'dialog') { result = eavConfig.systemroot + 'dnn'; }            // note: not tested yet
    if (area === 'dialog-page') { result = eavConfig.systemroot + 'dnn/ui.html'; } // note: not tested yet
    if (result.endsWith('/')) { result = result.substring(0, result.length - 1); }

    return result;
  }
}
