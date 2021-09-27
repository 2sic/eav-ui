import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Snippet } from '../code-editor/models/snippet.model';
import { EavWindow } from '../shared/models/eav-window.model';

declare const window: EavWindow;

@Component({
  selector: 'app-monaco-editor',
  template: `<div style="width: 100%; height: 100%; overflow: hidden;" #editor></div>`,
  styles: [':host { display: block; width: 100%; height: 100%; overflow: hidden; }'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonacoEditorComponent),
    multi: true,
  }],
})
export class MonacoEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editor') private editorRef: ElementRef<HTMLElement>;
  @Input() filename: string;
  @Input() snippets: Snippet[];
  @Input() options?: Record<string, any>;
  @Input() autoFocus = false;
  @Output() private focused = new EventEmitter<undefined>();
  @Output() private blured = new EventEmitter<undefined>();

  private value = '';
  private monaco?: any;
  private editorModel?: any;
  private editorInstance?: any;
  /**
   * TODO: Remove completionItemProvider when changing language or destroying editor.
   * Also don't register completionItemProvider multiple times.
   * https://github.com/react-monaco-editor/react-monaco-editor/issues/88
   */
  private completionItemProvider?: any;
  private observer?: ResizeObserver;

  propagateChange: (_: any) => void = () => { };
  propagateTouched: (_: any) => void = () => { };

  constructor() { }

  ngAfterViewInit(): void {
    this.observer = new ResizeObserver(entries => {
      this.editorInstance?.layout();
    });
    this.observer.observe(this.editorRef.nativeElement);

    window.require.config({
      paths: {
        vs: ['https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.25.2/min/vs'],
      },
    });

    window.require(['vs/editor/editor.main'], (monaco: any) => {
      this.monaco = monaco;
      this.monacoLoaded();
    });
  }

  insertSnippet(snippet: string): void {
    const snippetController = this.editorInstance?.getContribution('snippetController2');
    snippetController?.insert(snippet);
    this.editorInstance?.focus();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.completionItemProvider?.dispose();
    this.editorModel?.dispose();
    this.editorInstance?.dispose();
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.editorInstance?.getModel().setValue(this.value);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: any) => void): void {
    this.propagateTouched = fn;
  }

  monacoLoaded(): void {
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
    this.editorInstance = this.monaco.editor.create(this.editorRef.nativeElement, this.options);
    // editorInstance.updateOptions({ readOnly: true })
    this.editorModel = this.monaco.editor.createModel(this.value, undefined, this.monaco.Uri.file(this.filename));
    this.editorInstance.setModel(this.editorModel);
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodelupdateoptions.html
    // this.editor.getModel().updateOptions({ tabSize: 2 });

    if (this.snippets) {
      this.completionItemProvider = this.monaco.languages.registerCompletionItemProvider(this.editorInstance.getModel().getModeId(), {
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };
          return { suggestions: this.createDependencyProposals(range) };
        }
      });
    }

    this.editorInstance.getModel().onDidChangeContent(() => {
      this.propagateChange(this.editorInstance.getModel().getValue());
    });

    this.editorInstance.onDidFocusEditorWidget(() => {
      this.focused.emit();
    });

    this.editorInstance.onDidBlurEditorWidget(() => {
      this.blured.emit();
    });

    if (this.autoFocus) {
      this.editorInstance.focus();
    }
  }

  private createDependencyProposals(range: any) {
    // kind and rule copied from:
    // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example
    const monacoSnippets = this.snippets.map(snippet => ({
      label: snippet.name,
      kind: this.monaco.languages.CompletionItemKind.Snippet,
      documentation: `${snippet.title}\n${snippet.help}\n${snippet.links}`,
      insertText: snippet.content,
      insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    }));
    return monacoSnippets;
  }
}
