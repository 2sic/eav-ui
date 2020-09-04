import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { InputTypeName } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';

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
  openDnnDialog(oldValue: any, params: any, callback: any): void;
  getUrlOfIdDnnDialog(value: string, callback: any): void
}
