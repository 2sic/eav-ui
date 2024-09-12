import { Component, computed, inject } from '@angular/core';
import type * as Monaco from 'monaco-editor';
import { CustomJsonEditorLogic, StringJsonLogic } from './custom-json-editor-logic';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { MonacoEditorComponent } from '../../../../monaco-editor/monaco-editor.component';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { ControlHelpers } from '../../../shared/controls/control.helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { JsonSchema } from '../../../../monaco-editor/monaco-editor.models';
import { FormConfigService } from '../../../form/form-config.service';

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
  #fieldState = inject(FieldState) as FieldState<string>;
  #config = this.#fieldState.config;
  #control = this.#fieldState.control;

  protected controlStatus = this.#fieldState.controlStatus;
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
    ControlHelpers.patchControlValue(this.#control, code);
  }

  onFocused(): void {
    this.#config.focused$.next(true);
  }

  onBlurred(): void {
    if (!this.#control.touched)
      ControlHelpers.markControlTouched(this.#control);
    this.#config.focused$.next(false);
  }
}
