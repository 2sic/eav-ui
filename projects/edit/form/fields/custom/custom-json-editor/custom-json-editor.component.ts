import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { CustomJsonEditorLogic } from './custom-json-editor-logic';
import { CustomJsonEditorTemplateVars } from './custom-json-editor.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-json-editor',
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class CustomJsonEditorComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<CustomJsonEditorTemplateVars>;
  filename: string;
  editorOptions = {
    insertSpaces: false,
    minimap: {
      enabled: false
    },
    lineHeight: 19,
    scrollBeyondLastLine: false,
    tabSize: 2,
  };

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    CustomJsonEditorLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.filename = `${this.config.fieldName} ${this.config.entityGuid} ${this.eavService.eavConfig.formId}.json`;
    const rowCount$ = this.settings$.pipe(map(settings => settings.Rows), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$, this.config.focused$]),
      combineLatest([rowCount$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required, focused],
        [rowCount],
      ]) => {
        const templateVars: CustomJsonEditorTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          focused,
          rowCount,
          editorHeight: rowCount * this.editorOptions.lineHeight + 'px',
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  codeChanged(code: string): void {
    GeneralHelpers.patchControlValue(this.control, code);
  }

  onFocused(): void {
    this.config.focused$.next(true);
  }

  onBlurred(): void {
    if (!this.control.touched) {
      GeneralHelpers.markControlTouched(this.control);
    }
    this.config.focused$.next(false);
  }
}
