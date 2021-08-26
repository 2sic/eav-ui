import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { Snippet } from '../code-editor/models/snippet.model';
import { EavWindow } from '../shared/models/eav-window.model';

declare const window: EavWindow;

@Component({
  selector: 'app-monaco-editor',
  template: `<div style="width: 100%; height: 100%; overflow: hidden;" #editor></div>`,
  styles: [':host { display: block; width: 100%; height: 100%; }'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonacoEditorComponent),
    multi: true,
  }],
})
export class MonacoEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor') private editorRef: ElementRef<HTMLElement>;
  @Input() filename: string;
  @Input() snippets: Snippet[];

  private value = '';
  private monaco?: any;
  private editorModel?: any;
  private editor?: any;
  /**
   * TODO: Remove completionItemProvider when changing language or destroying editor.
   * Also don't register completionItemProvider multiple times.
   * https://github.com/react-monaco-editor/react-monaco-editor/issues/88
   */
  private completionItemProvider?: any;
  private subscription: Subscription;

  propagateChange: (_: any) => void = () => { };
  propagateTouched: (_: any) => void = () => { };

  constructor() { }

  ngOnInit(): void {
    this.subscription = new Subscription();

    this.subscription.add(
      fromEvent(window, 'resize').subscribe(() => {
        this.resize();
      })
    );
  }

  ngAfterViewInit(): void {
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
    const snippetController = this.editor?.getContribution('snippetController2');
    snippetController?.insert(snippet);
    this.editor?.focus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.completionItemProvider?.dispose();
    this.editorModel?.dispose();
    this.editor?.dispose();
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.editor?.getModel().setValue(this.value);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: any) => void): void {
    this.propagateTouched = fn;
  }

  monacoLoaded(): void {
    this.editor = this.monaco.editor.create(this.editorRef.nativeElement);
    this.editorModel = this.monaco.editor.createModel(this.value, undefined, this.monaco.Uri.file(this.filename));
    this.editor.setModel(this.editorModel);

    this.completionItemProvider = this.monaco.languages.registerCompletionItemProvider(this.editor.getModel().getModeId(), {
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

    this.editor.getModel().onDidChangeContent(() => {
      this.propagateChange(this.editor.getModel().getValue());
    });

    this.editor.focus();
    this.resize();
  }

  private resize(): void {
    // wait for Angular to update DOM to be able to get proper size of the container
    setTimeout(() => { this.editor?.layout(); }, 50);
  }

  private createDependencyProposals(range: any) {
    // kind and rule copied from:
    // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example
    const kind = 27;
    const insertTextRules = 4;
    const monacoSnippets = this.snippets.map(snippet => ({
      label: snippet.name,
      kind,
      documentation: `${snippet.title}\n${snippet.help}\n${snippet.links}`,
      insertText: snippet.content,
      insertTextRules,
      range,
    }));
    return monacoSnippets;
  }
}
