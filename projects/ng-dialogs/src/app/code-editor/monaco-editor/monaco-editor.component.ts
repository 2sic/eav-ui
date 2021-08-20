import inner from '!raw-loader!./inner.html';
import { Component, forwardRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subscription } from 'rxjs';
import { Snippet } from '../models/snippet.model';
import { monacoDetectLanguage } from './monaco-editor.helpers';

@Component({
  selector: 'app-monaco-editor',
  template: `<iframe style="width: 100%; height: 100%; border: 0;" [srcdoc]="inner | safeHtml" (load)="iframeLoaded($event)"></iframe>`,
  styles: [':host {display: block; width: 100%; height: 100%}'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonacoEditorComponent),
    multi: true,
  }],
})
export class MonacoEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filename: string;
  @Input() snippets: Snippet[];
  /** If value changes editor will be resized */
  @Input() toggleResize: boolean;

  inner = inner;

  private value = '';
  private monaco?: any;
  private editor?: any;
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

  ngOnChanges(changes: SimpleChanges): void {
    const resize = changes.toggleResize?.currentValue !== changes.toggleResize?.previousValue;
    if (resize) {
      this.resize();
    }
  }

  insertSnippet(snippet: string): void {
    const snippetController = this.editor?.getContribution('snippetController2');
    snippetController?.insert(snippet);
    this.editor?.focus();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.monaco?.editor.getModels().forEach((model: any) => model.dispose());
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

  /** spm TODO: Why iframe loads multiple times? */
  iframeLoaded(event: Event): void {
    const iframe = event.target as HTMLIFrameElement;
    const innerWindow = iframe.contentWindow as typeof window & Record<string, any>;
    const monaco = innerWindow.monaco;
    if (monaco == null) { return; }

    this.monaco = monaco;

    this.editor = this.monaco.editor.create(
      innerWindow.document.body.querySelector('#container'),
      {
        value: this.value,
        language: monacoDetectLanguage(this.filename),
      },
    );

    this.monaco.languages.registerCompletionItemProvider(monacoDetectLanguage(this.filename), {
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
