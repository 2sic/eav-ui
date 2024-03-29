import { UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { InputTypeName } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';
import { PagePickerResult } from './PagePickerResult';
import { FieldValue } from './FieldValue';
import { PickerItem } from './EntityInfo';

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
  getEntityCache(guids?: string[]): PickerItem[];
  getEntityCache$(guids?: string[]): Observable<PickerItem[]>;
}
