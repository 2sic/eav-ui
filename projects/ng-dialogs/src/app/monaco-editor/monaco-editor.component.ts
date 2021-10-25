import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  @Input() options?: Record<string, any>;
  @Input() jsonSchema?: JsonSchema;
  @Input() autoFocus = false;
  @Output() private valueChanged = new EventEmitter<string>();
  @Output() private focused = new EventEmitter<undefined>();
  @Output() private blurred = new EventEmitter<undefined>();

  private monacoInstance?: MonacoInstance;

  constructor() { }

  ngAfterViewInit(): void {
    window.require.config({
      paths: {
        vs: ['https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.25.2/min/vs'],
      },
    });

    window.require(['vs/editor/editor.main'], (monaco: any) => {
      this.monacoInstance = new MonacoInstance(
        monaco, this.filename, this.value, this.editorRef.nativeElement, this.options, this.snippets,
      );

      if (this.jsonSchema) {
        this.monacoInstance.setJsonSchema(this.jsonSchema);
      }

      this.monacoInstance.onValueChange(value => {
        this.valueChanged.emit(value);
      });

      this.monacoInstance.onFocus(() => {
        this.focused.emit();
      });

      this.monacoInstance.onBlur(() => {
        this.blurred.emit();
      });

      if (this.autoFocus) {
        this.monacoInstance.focus();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value != null) {
      this.monacoInstance?.updateValue(this.value);
    }
    if (changes.jsonSchema != null) {
      this.monacoInstance?.setJsonSchema(this.jsonSchema);
    }
    if (changes.snippets != null) {
      this.monacoInstance?.setSnippets(this.snippets);
    }
  }

  insertSnippet(snippet: string): void {
    this.monacoInstance?.insertSnippet(snippet);
    this.monacoInstance?.focus();
  }

  ngOnDestroy(): void {
    this.monacoInstance?.destroy();
  }
}
