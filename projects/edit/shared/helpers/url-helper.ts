import { EavConfig } from '../models';

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

  static getUrlPrefix(area: string, eavConfig: EavConfig) {
    let result = '';

    if (area === 'system') { result = eavConfig.systemRoot; }                    // used to link to JS-stuff and similar
    if (area === 'zone') { result = eavConfig.portalRoot; }                      // used to link to the site-root (like an image)
    if (area === 'app') { result = eavConfig.appRoot; }                          // used to find the app-root of something inside an app
    if (result.endsWith('/')) { result = result.substring(0, result.length - 1); }

    return result;
  }
}
