import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

import { ConnectorObservable } from '../../../../../../projects/shared/connector';
import { InputTypeName } from '../../../../shared/models/input-field-models';
import { FormSet } from '../../../../shared/models/eav/form-set';
import { HttpHeaders } from '@angular/common/http';

export class ExternalWebComponentProperties<T> {
    connector: ConnectorObservable<T>;
    experimental: ExperimentalProps;
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

export class ExperimentalProps {
    entityGuid: string;
    allInputTypeNames: InputTypeName[];
    updateField: (name: string, value: any) => void;
    formGroup: FormGroup;
    formSetValueChange$: Observable<FormSet>;
    isFeatureEnabled: (guid: string) => boolean;
    uploadUrl: string;
    uploadHeaders: HttpHeaders;
}

export class FieldState {
    name: string;
    value: any;
    disabled: boolean;
}
