import { TranslateService } from '@ngx-translate/core';

export class ExternalWebComponentProperties {
    id: string;
    config: any;
    form: any;
    host: any;
    translateService: TranslateService;

    value: any;
    disabled: boolean;
    // options: any

    adamSetValueCallback: any;
    adamAfterUploadCallback: any;
    // dnnBridgeprocessResult: any;
}
