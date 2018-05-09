import { FormControl } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

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

}
