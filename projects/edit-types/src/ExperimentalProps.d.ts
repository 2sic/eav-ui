import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Observable, BehaviorSubject } from 'rxjs';

import { InputTypeName } from './InputTypeName';
import { IAdamConfig } from './IAdamConfig';
import { AdamSetValue } from './AdamSetValue';
import { AdamAfterUpload } from './AdamAfterUpload';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
  formGroup: FormGroup;
  dropzoneConfig$?: BehaviorSubject<DropzoneConfigInterface>;
  translateService: TranslateService; // for WYSIWYG
  expandedField$: Observable<number>;

  updateField(name: string, value: any): void;
  setFocused(focused: boolean): void;
  isFeatureEnabled(guid: string): boolean;
  attachAdam(adamSetValue: AdamSetValue, adamAfterUpload: AdamAfterUpload): {
    toggleAdam: (value1: any, value2: any) => void;
    setAdamConfig: (adamConfig: IAdamConfig) => void;
    adamModeImage: () => void;
  };
  openDnnDialog(oldValue: any, params: any, callback: any): void;
  getUrlOfIdDnnDialog(value: string, callback: any): void
}
