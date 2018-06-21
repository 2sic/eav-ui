import { HttpHeaders } from '@angular/common/http';
import { EavConfiguration } from '../models/eav-configuration';

export class UrlHelper {

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
                queryParams[f.split('=')[0]] = f.split('=')[1];
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
}
