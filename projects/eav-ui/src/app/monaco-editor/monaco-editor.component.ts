import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import type * as Monaco from 'monaco-editor';
import { JsonSchema } from '.';
import { Snippet } from '../code-editor/models/snippet.model';
import { EavWindow } from '../shared/models/eav-window.model';
import { MonacoInstance } from './monaco-instance';

declare const window: EavWindow;

@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss'],
})
export class MonacoEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editor') private editorRef: ElementRef<HTMLElement>;
  @Input() filename: string;
  @Input() value: string;
  @Input() snippets?: Snippet[];
  @Input() options?: Monaco.editor.IStandaloneEditorConstructionOptions;
  @Input() jsonSchema?: JsonSchema;
  @Input() jsonComments?: Monaco.languages.json.SeverityLevel;
  @Input() javascriptDiagnostics?: Monaco.languages.typescript.DiagnosticsOptions;
  @Input() autoFocus = false;
  @Output() private valueChanged = new EventEmitter<string>();
  @Output() private focused = new EventEmitter<undefined>();
  @Output() private blurred = new EventEmitter<undefined>();

  private monaco: typeof Monaco;
  private monacoInstance?: MonacoInstance;

  constructor() { }

  ngAfterViewInit(): void {
    window.require.config({
      paths: {
        vs: ['https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs'],
      },
    });

    window.require(['vs/editor/editor.main'], (monaco: typeof Monaco) => {
      this.monaco = monaco;
      this.createEditor(this.autoFocus);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filename != null && this.monacoInstance != null) {
      this.monacoInstance.destroy();
      this.createEditor(true);
    }
    if (changes.value != null) {
      this.monacoInstance?.updateValue(this.value);
    }
    if (changes.jsonSchema != null) {
      this.monacoInstance?.setJsonSchema(this.jsonSchema);
    }
    if (changes.jsonComments != null) {
      this.monacoInstance?.setJsonComments(this.jsonComments);
    }
    if (changes.snippets != null) {
      this.monacoInstance?.setSnippets(this.snippets);
    }
    if (changes.disableJavascriptValidation != null) {
      this.monacoInstance?.setJavascriptDiagnostics(this.javascriptDiagnostics);
    }
  }

  insertSnippet(snippet: string): void {
    this.monacoInstance?.insertSnippet(snippet);
    this.monacoInstance?.focus();
  }

  ngOnDestroy(): void {
    this.monacoInstance?.destroy();
  }

  private createEditor(autoFocus: boolean): void {
    this.monacoInstance = new MonacoInstance(
      this.monaco, this.filename, this.value, this.editorRef.nativeElement, this.options, this.snippets,
    );

    this.monacoInstance.setJsonSchema(this.jsonSchema);
    this.monacoInstance.setJsonComments(this.jsonComments);
    this.monacoInstance.setJavascriptDiagnostics(this.javascriptDiagnostics);

    this.monacoInstance.onValueChange(value => {
      this.valueChanged.emit(value);
    });

    this.monacoInstance.onFocus(() => {
      this.focused.emit();
    });

    this.monacoInstance.onBlur(() => {
      this.blurred.emit();
    });

    if (autoFocus) {
      this.monacoInstance.focus();
    }
  }
}
