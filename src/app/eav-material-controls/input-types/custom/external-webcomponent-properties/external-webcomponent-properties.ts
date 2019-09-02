import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Observable, BehaviorSubject } from 'rxjs';

import { ConnectorObservable } from '../../../../../../projects/shared/connector';
import { InputTypeName } from '../../../../shared/models/input-field-models';
import { FormSet } from '../../../../shared/models/eav/form-set';

export class ExternalWebComponentProperties<T> {
    connector: ConnectorObservable<T>;
    experimental: ExperimentalProps;
    host: any;
    translateService: TranslateService; // for Angular WYSIWYG. Should remove sometime in the future

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
    dropzoneConfig$?: BehaviorSubject<DropzoneConfigInterface>;
    translateService: TranslateService; // for Typescript WYSIWYG
}

export class FieldState {
    name: string;
    value: any;
    disabled: boolean;
}
