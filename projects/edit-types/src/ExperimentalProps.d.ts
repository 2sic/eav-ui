import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { InputTypeName } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';
import { DnnBridgeConnectorParams } from '../../edit/eav-material-controls/input-types/dnn-bridge/dnn-bridge.models';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
  formGroup: FormGroup;
  translateService: TranslateService; // for WYSIWYG
  isExpanded$: Observable<boolean>;
  dropzone: Dropzone;
  adam: Adam;

  updateField(name: string, value: any): void;
  setFocused(focused: boolean): void;
  isFeatureEnabled(guid: string): boolean;
  openPagePicker(params: DnnBridgeConnectorParams, callback: (value: any) => void): void;
  getUrlOfId(value: string, callback: (value: string) => void): void;
}
