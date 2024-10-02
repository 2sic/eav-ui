import { Injector, Signal } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { FieldMask } from '../../eav-ui/src/app/edit/shared/helpers';
import { Adam } from './Adam';
import { Dropzone } from './Dropzone';
import { FieldValue } from './FieldValue';
import { AttributeInputType } from './InputTypeName';
import { PagePickerResult } from './PagePickerResult';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: AttributeInputType[];
  formGroup: UntypedFormGroup;
  translateService: TranslateService;
  isExpanded$: Observable<boolean>;
  dropzone: Dropzone;
  adam: Adam;
  updateField(name: string, value: FieldValue): void;
  setFocused(focused: boolean): void;
  isFeatureEnabled: Record<string, Signal<boolean>>;
  openPagePicker(callback: (value: PagePickerResult) => void): void;
  featureDisabledWarning(featureNameId: string): void;
  getUrlOfId(value: string, callback: (value: string) => void): void;
  getSettings(name: string): any;
  
  /** 2024-06-20 2dm - temporary solutions as GPS needs the mask */
  getFieldMask(mask: string, name?: string, watch?: boolean): FieldMask;

  /** 2024-09-03 v18 2dm - injector so effects can be used */
  injector: Injector;
}
