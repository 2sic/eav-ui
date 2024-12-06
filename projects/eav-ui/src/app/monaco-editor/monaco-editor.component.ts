import { AfterViewInit, Component, ElementRef, input, OnChanges, OnDestroy, output, SimpleChanges, ViewChild } from '@angular/core';
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';
import { JsonSchema } from '.';
import { Snippet } from '../code-editor/models/snippet.model';
import { Tooltip } from '../code-editor/models/tooltip.model';
import { nameof } from '../shared/typescript-helpers';
import { MonacoInstance } from './monaco-instance';

@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss'],
  standalone: true,
})
export class MonacoEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editor') private editorRef: ElementRef<HTMLElement>;
  filename = input<string>();
  value = input<string>();
  tooltips? = input<Tooltip[]>();
  snippets? = input<Snippet[]>();
  options? = input<Monaco.editor.IStandaloneEditorConstructionOptions>();
  jsonSchema? = input<JsonSchema>();
  jsonComments? = input<Monaco.languages.json.SeverityLevel>();
  jsTypings? = input<string>();
  jsDiagnostics? = input<Monaco.languages.typescript.DiagnosticsOptions>();

  autoFocus = input<boolean>(false);
  
  protected valueChanged = output<string>();
  protected focused = output<void>();
  protected blurred = output<void>();

  private monaco?: typeof Monaco;
  private monacoInstance?: MonacoInstance;

  constructor() { }

  ngAfterViewInit(): void {
    loader.init().then(monaco => {
      this.monaco = monaco;
      this.createEditor(this.autoFocus());
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes[nameof<MonacoEditorComponent>('filename')] != null && this.monacoInstance != null) {
      this.monacoInstance.destroy();
      this.createEditor(true);
    }
    if (changes[nameof<MonacoEditorComponent>('value')] != null) {
      this.monacoInstance?.updateValue(this.value());
    }
    if (changes[nameof<MonacoEditorComponent>('jsonSchema')] != null) {
      this.monacoInstance?.setJsonSchema(this.jsonSchema());
    }
    if (changes[nameof<MonacoEditorComponent>('jsonComments')] != null) {
      this.monacoInstance?.setJsonComments(this.jsonComments());
    }
    if (changes[nameof<MonacoEditorComponent>('snippets')] != null) {
      this.monacoInstance?.setSnippets(this.snippets());
    }
    if (changes[nameof<MonacoEditorComponent>('tooltips')] != null) {
      this.monacoInstance?.setTooltips(this.tooltips());
    }
    if (changes[nameof<MonacoEditorComponent>('jsTypings')] != null) {
      this.monacoInstance?.setJsTypings(this.jsTypings());
    }
    if (changes[nameof<MonacoEditorComponent>('jsDiagnostics')] != null) {
      this.monacoInstance?.setJsDiagnostics(this.jsDiagnostics());
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
      this.monaco, this.filename(), this.value(), this.editorRef.nativeElement, this.options(), this.snippets(), this.tooltips(),
    );

    this.monacoInstance.setJsonSchema(this.jsonSchema());
    this.monacoInstance.setJsonComments(this.jsonComments());
    this.monacoInstance.setJsTypings(this.jsTypings());
    this.monacoInstance.setJsDiagnostics(this.jsDiagnostics());

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
