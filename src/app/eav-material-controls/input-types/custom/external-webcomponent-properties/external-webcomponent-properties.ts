import { TranslateService } from '@ngx-translate/core';
import { ConnectorObservable } from '../../../../../../projects/shared/connector';
import { Observable } from 'rxjs/Observable';
import { InputTypeName } from '../../../../shared/helpers/input-field-models';

export class ExternalWebComponentProperties<T> {
    connector: ConnectorObservable<T>;
    hiddenProps: HiddenProps;
    host: any;
    translateService: TranslateService;

    adamSetValueCallback: any;
    adamAfterUploadCallback: any;
    // dnnBridgeprocessResult: any;
}

export class HiddenProps {
    allInputTypeNames: InputTypeName[];
    fieldStates$: Observable<FieldState[]>;
}

export class FieldState {
    name: string;
    value: any;
    disabled: boolean;
}
