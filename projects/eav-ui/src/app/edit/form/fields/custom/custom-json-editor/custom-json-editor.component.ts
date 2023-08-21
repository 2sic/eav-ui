import { Component, OnDestroy, OnInit } from '@angular/core';
import type * as Monaco from 'monaco-editor';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { JsonSchema } from '../../../../../monaco-editor';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { CustomJsonEditorLogic, StringJsonLogic } from './custom-json-editor-logic';
import { CustomJsonEditorViewModel } from './custom-json-editor.models';

@Component({
  selector: InputTypeConstants.CustomJsonEditor,
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class CustomJsonEditorComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel$: Observable<CustomJsonEditorViewModel>;
  filename: string;
  monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: {
      enabled: false,
    },
    lineHeight: 19,
    lineNumbers: 'off',
    lineDecorationsWidth: 0,
    folding: false,
    scrollBeyondLastLine: false,
    tabSize: 2,
    fixedOverflowWidgets: true,
  };

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    CustomJsonEditorLogic.importMe();
    StringJsonLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.filename = `${this.config.fieldName} ${this.config.entityGuid} ${this.eavService.eavConfig.formId}.json`;
    const rowCount$ = this.settings$.pipe(map(settings => settings.Rows), distinctUntilChanged());
    const jsonSchema$ = this.settings$.pipe(
      map(settings => {
        if (settings.JsonSchemaMode === 'none') { return; }

        const jsonSchema: JsonSchema = {
          type: settings.JsonSchemaSource,
          value: settings.JsonSchemaSource === 'link' ? settings.JsonSchemaUrl : settings.JsonSchemaRaw,
        };
        return jsonSchema;
      }),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    const jsonComments$ = this.settings$.pipe(
      map(settings => {
        const jsonComments: Monaco.languages.json.SeverityLevel = settings.JsonCommentsAllowed ? 'ignore' : 'error';
        return jsonComments;
      }),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$, this.config.focused$]),
      combineLatest([rowCount$, jsonSchema$, jsonComments$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required, focused],
        [rowCount, jsonSchema, jsonComments],
      ]) => {
        const viewModel: CustomJsonEditorViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          focused,
          rowCount,
          editorHeight: rowCount * this.monacoOptions.lineHeight + 'px',
          jsonSchema,
          jsonComments,
        };
        return viewModel;
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
