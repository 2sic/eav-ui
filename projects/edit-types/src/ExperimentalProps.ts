import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { InputTypeName } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';
import { PagePickerResult } from './PagePickerResult';
import { FieldValue } from './FieldValue';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
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
}
