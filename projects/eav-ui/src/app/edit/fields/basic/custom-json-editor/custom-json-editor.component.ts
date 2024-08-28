import { Component, computed, inject, Signal } from '@angular/core';
import type * as Monaco from 'monaco-editor';
import { CustomJsonEditorLogic, StringJsonLogic } from './custom-json-editor-logic';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { MonacoEditorComponent } from '../../../../monaco-editor/monaco-editor.component';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';
import { JsonSchema } from '../../../../monaco-editor/monaco-editor.models';
import { FormConfigService } from '../../../state/form-config.service';
import { ControlStatus } from '../../../shared/models/control-status.model';

@Component({
  selector: InputTypeCatalog.CustomJsonEditor,
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    ExtendedModule,
    MatFormFieldModule,
    MonacoEditorComponent,
    NgStyle,
    FieldHelperTextComponent,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class CustomJsonEditorComponent {
  protected fieldState = inject(FieldState);
  protected config = this.fieldState.config;
  protected control = this.fieldState.control;

  protected controlStatus = this.fieldState.controlStatus as Signal<ControlStatus<string>>;
  protected basics = this.fieldState.basics;
  protected settings = this.fieldState.settings;

  protected rows = computed(() => this.settings().Rows, SignalHelpers.numberEquals);
  protected focused = computed(() => this.config.focused$);

  editorHeight = computed(() => {
    return this.rows() * this.monacoOptions.lineHeight + 'px';
  });

  jsonSchema = computed(() => {
    const settings = this.settings();
    if (settings.JsonSchemaMode === 'none') { return; }
    const jsonSchema: JsonSchema = {
      type: settings.JsonSchemaSource,
      value: settings.JsonSchemaSource === 'link' ? settings.JsonSchemaUrl : settings.JsonSchemaRaw,
    };
    return jsonSchema;
  });

  jsonComments = computed(() => {
    const settings = this.settings();
    const jsonComments: Monaco.languages.json.SeverityLevel = settings.JsonCommentsAllowed ? 'ignore' : 'error';
    return jsonComments;
  });

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

  constructor(private formConfig: FormConfigService) {
    CustomJsonEditorLogic.importMe();
    StringJsonLogic.importMe();
  }

  ngOnInit() {
    this.filename = `${this.config.fieldName} ${this.config.entityGuid} ${this.formConfig.config.formId}.json`;
  }

  codeChanged(code: string): void {
    ControlHelpers.patchControlValue(this.control, code);
  }

  onFocused(): void {
    this.config.focused$.next(true);
  }

  onBlurred(): void {
    if (!this.control.touched) {
      ControlHelpers.markControlTouched(this.control);
    }
    this.config.focused$.next(false);
  }
}
