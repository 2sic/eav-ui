import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { Observable, BehaviorSubject } from 'rxjs';

import { WysiwygSettings } from './WysiwygSettings';
import { InputTypeName } from './InputTypeName';
import { FormSet } from './FormSet';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
  formGroup: FormGroup;
  // TODO: SPM - this seems unused, can we remove it
  // formSetValueChange$: Observable<FormSet>;
  dropzoneConfig$?: BehaviorSubject<DropzoneConfigInterface>;
  translateService: TranslateService; // for WYSIWYG
  wysiwygSettings?: WysiwygSettings; // only if field is of WYSIWYG input type
  expandedField$: Observable<number>;

  updateField(name: string, value: any): void;
  setFocused(focused: boolean): void;
  isFeatureEnabled(guid: string): boolean;
}
