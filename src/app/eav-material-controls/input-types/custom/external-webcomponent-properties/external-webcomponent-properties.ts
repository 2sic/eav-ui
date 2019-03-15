import { TranslateService } from '@ngx-translate/core';
import { Connector } from '../../../../../../projects/shared/connector';

export class ExternalWebComponentProperties {
    connector: Connector;
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
