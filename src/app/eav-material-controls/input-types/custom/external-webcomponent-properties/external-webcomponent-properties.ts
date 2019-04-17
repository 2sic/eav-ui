import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { FormGroup } from '@angular/forms';

import { ConnectorObservable } from '../../../../../../projects/shared/connector';
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

// spm 2019.04.08. split to separate files
/** Props and methods available to the connector to communicate with the host */
export class ConnectorHost<T> {
    update: (value: T) => void;
}

export class HiddenProps {
    allInputTypeNames: InputTypeName[];
    updateField: (name: string, value: any) => void;
    formGroup: FormGroup;
    formSetValueChange$: Observable<any>;
}

export class FieldState {
    name: string;
    value: any;
    disabled: boolean;
}
