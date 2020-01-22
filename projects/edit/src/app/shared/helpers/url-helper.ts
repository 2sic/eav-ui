import { HttpHeaders } from '@angular/common/http';
import { EavConfiguration } from '../models/eav-configuration';
import { UrlConstants } from '../constants/url-constants';

export class UrlHelper {

    private static readonly serviceScopes = ['app', 'app-sys', 'app-api', 'app-query', 'app-content', 'eav', 'view', 'dnn'];

    static createHeader = (tabId: string, moduleId: string, contentBlockId: string): HttpHeaders => {
        return new HttpHeaders({
            'TabId': tabId,
            'ContentBlockId': moduleId,
            'ModuleId': contentBlockId,
            'Content-Type': 'application/json;charset=UTF-8',
            'RequestVerificationToken': 'abcdefgihjklmnop'
        });
    }

    static readQueryStringParameters(url: string): { [key: string]: string } {
        const queryParams: { [key: string]: string } = {};
        url.split('&').forEach(f => {
            if (f.split('=').length === 2) {
                queryParams[f.split('=')[0]] = decodeURIComponent(f.split('=')[1].replace(/\+/g, ' '));
            }
        });
        return queryParams;
    }

    /**
     * Create EavCongiguration from queryStringParams
     */
    static getEavConfiguration = (queryParams: { [key: string]: string }): EavConfiguration => {
        return new EavConfiguration(
            queryParams['zoneId'],
            queryParams['appId'],
            queryParams['approot'],
            queryParams['cbid'],
            queryParams['debug'],
            queryParams['dialog'],
            queryParams['items'],
            queryParams['lang'],
            queryParams['langpri'],
            queryParams['langs'],
            queryParams['mid'],
            queryParams['mode'],
            queryParams['partOfPage'],
            queryParams['portalroot'],
            queryParams['publishing'],
            queryParams['tid'],
            queryParams['websiteroot'],
            UrlHelper.getVersioningOptions(queryParams['partOfPage'] === 'true', queryParams['publishing'])
        );
    }

    private static getVersioningOptions(partOfPage: boolean, publishing: string) {
        if (!partOfPage) {
            return { show: true, hide: true, branch: true };
        }

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

    /**
 * converts a short api-call path like "/app/Blog/query/xyz" to the DNN full path
 * which varies from installation to installation like "/desktopmodules/api/2sxc/app/..."
 * @param virtualPath
 * @returns mapped path
 */
    public static resolveServiceUrl(virtualPath: string, serviceRoot: string): string {
        const scope = virtualPath.split('/')[0].toLowerCase();

        // stop if it's not one of our special paths
        if (this.serviceScopes.indexOf(scope) === -1) {
            return virtualPath;
        }

        return serviceRoot + scope + '/' + virtualPath.substring(virtualPath.indexOf('/') + 1);
    }

    public static replaceUrlParam(url: string, paramName: string, paramValue: string) {
        if (paramValue === null) {
            paramValue = '';
        }
        const pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
        if (url.search(pattern) >= 0) {
            return url.replace(pattern, '$1' + paramValue + '$2');
        }
        url = url.replace(/[?#]$/, '');
        return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
    }

    public static getUrlPrefix(area: string, eavConfig: EavConfiguration) {
        let result = '';
        if (area === 'api') {
            const serviceRoot = eavConfig.portalroot + UrlConstants.apiRoot;
            const url = UrlHelper.resolveServiceUrl('eav/', serviceRoot);
            result = url.substr(0, url.length - 5);
        }

        if (area === 'system') { result = eavConfig.systemroot; }                    // used to link to JS-stuff and similar
        if (area === 'zone') { result = eavConfig.portalroot; }                      // used to link to the site-root (like an image)
        if (area === 'app') { result = eavConfig.approot; }                          // used to find the app-root of something inside an app
        if (area === 'dialog') { result = eavConfig.systemroot + 'dnn'; }            // note: not tested yet
        if (area === 'dialog-page') { result = eavConfig.systemroot + 'dnn/ui.html'; } // note: not tested yet
        if (result.endsWith('/')) { result = result.substring(0, result.length - 1); }

        return result;
    }
}
