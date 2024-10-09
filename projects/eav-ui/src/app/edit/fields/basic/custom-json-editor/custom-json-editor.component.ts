import { NgClass, NgStyle } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import type * as Monaco from 'monaco-editor';
import { CustomJsonEditor } from 'projects/edit-types/src/FieldSettings-CustomJsonEditor';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { MonacoEditorComponent } from '../../../../monaco-editor/monaco-editor.component';
import { JsonSchema } from '../../../../monaco-editor/monaco-editor.models';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { FormConfigService } from '../../../form/form-config.service';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { CustomJsonEditorLogic, StringJsonLogic } from './custom-json-editor-logic';

@Component({
  selector: InputTypeCatalog.CustomJsonEditor,
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    MatFormFieldModule,
    MonacoEditorComponent,
    NgStyle,
    FieldHelperTextComponent,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class CustomJsonEditorComponent {
  #fieldState = inject(FieldState) as FieldState<string, FieldSettings & CustomJsonEditor>;
  #config = this.#fieldState.config;

  protected ui = this.#fieldState.ui;
  protected uiValue = this.#fieldState.uiValue;
  protected basics = this.#fieldState.basics;
  #settings = this.#fieldState.settings;

  #rows = computed(() => this.#settings().Rows, SignalEquals.number);
  protected focused = computed(() => this.#config.focused$);

  protected editorHeight = computed(() => {
    return this.#rows() * this.monacoOptions.lineHeight + 'px';
  });

  protected jsonSchema = computed(() => {
    const settings = this.#settings();
    if (settings.JsonSchemaMode === 'none') return;
    const jsonSchema: JsonSchema = {
      type: settings.JsonSchemaSource,
      value: settings.JsonSchemaSource === 'link' ? settings.JsonSchemaUrl : settings.JsonSchemaRaw,
    };
    return jsonSchema;
  });

  protected jsonComments = computed(() => {
    const settings = this.#settings();
    const jsonComments: Monaco.languages.json.SeverityLevel = settings.JsonCommentsAllowed ? 'ignore' : 'error';
    return jsonComments;
  });

  protected filename: string;
  protected monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
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
    this.filename = `${this.#config.fieldName} ${this.#config.entityGuid} ${this.formConfig.config.formId}.json`;
  }

  codeChanged(code: string): void {
    this.ui().setIfChanged(code);
  }

  onFocused(): void {
    this.#config.focused$.next(true);
  }

  onBlurred(): void {
    this.ui().markTouched();
    this.#config.focused$.next(false);
  }
}
