// tslint:disable-next-line:max-line-length
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { JsonSchema } from '.';
import { Snippet } from '../code-editor/models/snippet.model';
import { EavWindow } from '../shared/models/eav-window.model';

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
  @Input() snippets: Snippet[];
  @Input() options?: Record<string, any>;
  @Input() jsonSchema?: JsonSchema;
  @Input() autoFocus = false;
  @Output() private valueChanged = new EventEmitter<string>();
  @Output() private focused = new EventEmitter<undefined>();
  @Output() private blured = new EventEmitter<undefined>();

  private cachedValue: string;
  private monaco?: any;
  private editorModelUri?: any;
  private editorModel?: any;
  private editorInstance?: any;
  /**
   * TODO: Remove completionItemProvider when changing language or destroying editor.
   * Also don't register completionItemProvider multiple times.
   * https://github.com/react-monaco-editor/react-monaco-editor/issues/88
   */
  private completionItemProviders: any[] = [];
  private observer?: ResizeObserver;

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
      this.addThemes();
      this.monacoLoaded();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jsonSchema != null) {
      this.setJsonSchema();
    }
    if (changes.value != null) {
      if (this.cachedValue !== this.value) {
        this.cachedValue = this.value;
        this.editorInstance?.getModel().setValue(this.value);
      }
    }
  }

  insertSnippet(snippet: string): void {
    const snippetController = this.editorInstance?.getContribution('snippetController2');
    snippetController?.insert(snippet);
    this.editorInstance?.focus();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.completionItemProviders.forEach(completionItemProvider => {
      completionItemProvider.dispose();
    });
    this.editorModel?.dispose();
    this.editorInstance?.dispose();
  }

  monacoLoaded(): void {
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
    this.editorInstance = this.monaco.editor.create(this.editorRef.nativeElement, this.options);
    // editorInstance.updateOptions({ readOnly: true })
    this.editorModelUri = this.monaco.Uri.file(this.filename);
    this.editorModel = this.monaco.editor.createModel(this.value, undefined, this.editorModelUri);
    this.editorInstance.setModel(this.editorModel);
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodelupdateoptions.html
    // this.editor.getModel().updateOptions({ tabSize: 2 });
    this.setJsonSchema();
    this.addSnippets();

    this.editorInstance.getModel().onDidChangeContent(() => {
      const newValue = this.editorInstance.getModel().getValue();
      if (newValue !== this.cachedValue) {
        this.cachedValue = newValue;
        this.valueChanged.emit(newValue);
      }
    });

    // this.editorInstance.onDidChangeModelDecorations((e: any) => {
    //   const value = this.editorInstance.getModel().getValue();
    //   const markers = this.monaco.editor.getModelMarkers({}).filter((marker: any) => marker.resource.path === `/${this.filename}`);
    //   const valid = !markers.some(
    //     (marker: any) => marker.severity === this.monaco.MarkerSeverity.Error || marker.severity === this.monaco.MarkerSeverity.Warning
    //   );
    // });

    // this.monaco.editor.onDidChangeMarkers(() => {
    //   // markers updates are async and lagging behind value updates
    //   const markers = this.monaco.editor.getModelMarkers({}).filter((marker: any) => marker.resource.path === `/${this.filename}`);
    //   if (markers.some((marker: any) => marker.severity === this.monaco.MarkerSeverity.Error)) {
    //     // has errors
    //   } else if (markers.some((marker: any) => marker.severity === this.monaco.MarkerSeverity.Warning)) {
    //     // has warnings
    //   } else {
    //     // has no errors or warnings
    //   }
    // });

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

  private setJsonSchema(): void {
    if (this.monaco == null || this.editorModelUri == null || this.jsonSchema == null) { return; }

    const diagnosticsOptions = {
      ...this.monaco.languages.json.jsonDefaults.diagnosticsOptions,
      enableSchemaRequest: true,
      schemaRequest: 'warning',
      schemaValidation: 'warning',
      validate: true,
    };

    const exists = diagnosticsOptions.schemas.some((schema: any) => schema.fileMatch[0] === this.editorModelUri.toString());
    if (exists) {
      diagnosticsOptions.schemas = diagnosticsOptions.schemas.map((schema: any) => {
        if (schema.fileMatch[0] !== this.editorModelUri.toString()) { return schema; }
        return this.buildCurrentSchema();
      });
    } else {
      diagnosticsOptions.schemas = [
        ...diagnosticsOptions.schemas,
        this.buildCurrentSchema(),
      ];
    }

    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(diagnosticsOptions);
  }

  private buildCurrentSchema() {
    const schema = this.jsonSchema.type === 'link'
      ? {
        uri: this.jsonSchema.value,
        fileMatch: [this.editorModelUri.toString()],
      }
      : {
        uri: this.editorModelUri.toString(),
        fileMatch: [this.editorModelUri.toString()],
        schema: JSON.parse(this.jsonSchema.value),
      };
    return schema;
  }

  private addThemes(): void {
    // TODO: make a more robust check if themes were added
    if (this.monaco.themesWereAdded) { return; }
    this.monaco.themesWereAdded = true;

    this.monaco.editor.defineTheme('2sxc-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'metatag.cs', foreground: 'ffff00' },
      ],
    });
  }

  private addSnippets(): void {
    // TODO: make a more robust check if snippets were added
    if (this.monaco.snippetsWereAdded) { return; }
    this.monaco.snippetsWereAdded = true;

    this.completionItemProviders.push(
      this.monaco.languages.registerCompletionItemProvider(this.editorInstance.getModel().getModeId(), {
        triggerCharacters: ['>'],
        provideCompletionItems: (model: any, position: any) => {
          const textUntilPosition: string = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // sometimes trigger character is wrong
          const trigger = textUntilPosition[textUntilPosition.length - 1];
          if (trigger !== '>') { return { suggestions: [] }; }

          const tagStartIndex = textUntilPosition.lastIndexOf('<');
          if (tagStartIndex === -1) { return { suggestions: [] }; }

          const codeInTag = textUntilPosition.substring(tagStartIndex);
          // check that > is not in between quotes like in <div class="car>"
          let quotes = 0;
          Array.from(codeInTag).forEach(c => {
            if (c === '"') { quotes++; }
          });
          if (quotes % 2 !== 0) { return { suggestions: [] }; }
          // check that it's not a closing tag
          if (codeInTag.startsWith('</')) { return { suggestions: [] }; }
          // check that tag is not already closed
          if (codeInTag.indexOf('>') !== codeInTag.length - 1) { return { suggestions: [] }; }

          // tag name ends with space or tag is closed completely
          let tagEndIndex = codeInTag.indexOf(' ');
          if (tagEndIndex === -1) {
            tagEndIndex = codeInTag.indexOf('>');
          }
          if (tagEndIndex === -1) { return { suggestions: [] }; }

          const tag = codeInTag.substring(1, tagEndIndex);
          if (!tag) { return { suggestions: [] }; }
          if (!/[a-zA-Z0-9_-]/.test(tag)) { return { suggestions: [] }; }

          const suggestions = [{
            label: `</${tag}>`,
            kind: this.monaco.languages.CompletionItemKind.Snippet,
            insertText: `\$0</${tag}>`,
            insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column,
            },
          }];
          return { suggestions };
        },
      }),
    );

    if (this.snippets) {
      this.completionItemProviders.push(
        this.monaco.languages.registerCompletionItemProvider(this.editorInstance.getModel().getModeId(), {
          provideCompletionItems: (model: any, position: any) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };
            // kind and rule copied from:
            // https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example
            const suggestions = this.snippets.map(snippet => {
              if (!snippet.content) { return; }
              return {
                label: snippet.name,
                kind: this.monaco.languages.CompletionItemKind.Snippet,
                documentation: `${snippet.title ?? ''}\n${snippet.help ?? ''}\n${snippet.links ?? ''}`,
                insertText: snippet.content,
                insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              };
            }).filter(snippet => !!snippet);
            return { suggestions };
          },
        }),
      );
    }
  }
}
