import { Observable } from 'rxjs';

export class AppAdministrationDialogDataModel {
    zoneId: string;
    appId: number;
    tabPath$: Observable<string>;
}
