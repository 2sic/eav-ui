import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { InputTypeName } from './InputTypeName';
import { Dropzone } from './Dropzone';
import { Adam } from './Adam';
import { PagePickerResult } from './PagePickerResult';
import { FieldValue } from './FieldValue';
import { EntityInfo } from './EntityInfo';

export interface ExperimentalProps {
  entityGuid: string;
  allInputTypeNames: InputTypeName[];
  formGroup: FormGroup;
  translateService: TranslateService;
  isExpanded$: Observable<boolean>;
  dropzone: Dropzone;
  adam: Adam;
  updateField(name: string, value: FieldValue): void;
  setFocused(focused: boolean): void;
  isFeatureEnabled(nameId: string): boolean;
  openPagePicker(callback: (value: PagePickerResult) => void): void;
  getUrlOfId(value: string, callback: (value: string) => void): void;
  getEntityCache(guids?: string[]): EntityInfo[];
  getEntityCache$(guids?: string[]): Observable<EntityInfo[]>;
}
