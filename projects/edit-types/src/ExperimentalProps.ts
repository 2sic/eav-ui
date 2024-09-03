import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AttributeInputType } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';
import { PagePickerResult } from './PagePickerResult';
import { FieldValue } from './FieldValue';
import { FieldMask } from '../../eav-ui/src/app/edit/shared/helpers';
import { Injector } from '@angular/core';

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
  isFeatureEnabled$(nameId: string): Observable<boolean>;
  openPagePicker(callback: (value: PagePickerResult) => void): void;
  featureDisabledWarning(featureNameId: string): void;
  getUrlOfId(value: string, callback: (value: string) => void): void;
  getSettings(name: string): any;
  // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
  // getEntityCache(guids?: string[]): PickerItem[];
  // getEntityCache$(guids?: string[]): Observable<PickerItem[]>;

  /** 2024-06-20 2dm - temporary solutions as GPS needs the mask */
  getFieldMask(mask: string, name?: string, watch?: boolean): FieldMask;

  /** 2024-09-03 v18 2dm - injector so effects can be used */
  injector: Injector;
}
