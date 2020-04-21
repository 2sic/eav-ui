import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Observable, BehaviorSubject } from 'rxjs';

import { InputTypeName } from './InputTypeName';

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
}
