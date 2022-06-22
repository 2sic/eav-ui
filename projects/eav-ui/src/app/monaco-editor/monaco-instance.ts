import type * as Monaco from 'monaco-editor';
import { JsonSchema, Monaco2sxc } from '.';
import { Snippet } from '../code-editor/models/snippet.model';
import { Tooltip } from '../code-editor/models/tooltip.model';

export const voidElements = 'area, base, br, col, embed, hr, img, input, link, meta, param, source, track, wbr'
  .split(',')
  .map(el => el.trim().toLocaleLowerCase());

export class MonacoInstance {
  /** Editor instance configuration */
  private editorInstance: Monaco.editor.IStandaloneCodeEditor;
  private completionItemProviders: Monaco.IDisposable[];
  private jsTypingsLib?: Monaco.IDisposable;
  private resizeObserver: ResizeObserver;
  private globalCache: Monaco2sxc;
  private cachedValue: string;
  private valueChangedCallback?: (value: string) => void;
  private focusedCallback?: () => void;
  private blurredCallback?: () => void;

  constructor(
    /** Global Monaco configuration */
    private monaco: typeof Monaco,
    private filename: string,
    value: string,
    container: HTMLElement,
    options: Monaco.editor.IStandaloneEditorConstructionOptions,
    private snippets: Snippet[],
    private tooltips: Tooltip[],
  ) {
    this.globalCache = this.createGlobalCache(monaco);
    this.defineThemes(this.globalCache, this.monaco);
    this.cachedValue = value;
    this.editorInstance = this.createInstance(this.monaco, filename, value, container, options);
    this.completionItemProviders = this.addSnippets(this.monaco, this.editorInstance);
    this.resizeObserver = this.createResizeObserver(container, this.editorInstance);
    this.restoreState(this.globalCache, this.editorInstance);
    this.addEvents(this.editorInstance);
  }

  destroy(): void {
    this.saveState(this.globalCache, this.editorInstance);
    this.resizeObserver.disconnect();
    this.completionItemProviders.forEach(completionItemProvider => completionItemProvider.dispose());
    this.jsTypingsLib?.dispose();
    this.editorInstance.getModel().dispose();
    this.editorInstance.dispose();
  }

  updateValue(value: string): void {
    if (this.cachedValue === value) { return; }
    this.cachedValue = value;
    this.editorInstance.getModel().setValue(value);
  }

  focus(): void {
    this.editorInstance.focus();
  }

  onValueChange(callback: (value: string) => void): void {
    this.valueChangedCallback = callback;
  }

  onFocus(callback: () => void): void {
    this.focusedCallback = callback;
  }

  onBlur(callback: () => void): void {
    this.blurredCallback = callback;
  }

  insertSnippet(snippet: string): void {
    const snippetController = this.editorInstance
      .getContribution<Monaco.editor.IEditorContribution & { insert(template: string, opts?: Record<string, any>): void; }>('snippetController2');
    snippetController.insert(snippet);
  }

  setSnippets(snippets: Snippet[]): void {
    this.snippets = snippets;
  }

  setTooltips(tooltips: Tooltip[]): void {
    this.tooltips = tooltips;
  }

  setJsonSchema(jsonSchema?: JsonSchema): void {
    const uri = this.editorInstance.getModel().uri.toString();
    const oldJsonDiagnostics = this.monaco.languages.json.jsonDefaults.diagnosticsOptions;
    const exists = oldJsonDiagnostics.schemas?.some(schema => schema.fileMatch[0] === uri) ?? false;

    const newSchema: Monaco.languages.json.DiagnosticsOptions['schemas'][0] = jsonSchema?.type === 'link'
      ? { uri: jsonSchema.value, fileMatch: [uri] }
      : jsonSchema?.type === 'raw'
        ? { uri, fileMatch: [uri], schema: JSON.parse(jsonSchema.value) }
        : undefined;

    if (!exists && !newSchema) { return; }

    const newJsonDiagnostics: Monaco.languages.json.DiagnosticsOptions = {
      ...oldJsonDiagnostics,
      enableSchemaRequest: true,
      schemas: exists && !newSchema
        ? oldJsonDiagnostics.schemas.filter(schema => schema.fileMatch[0] !== uri)
        : exists
          ? oldJsonDiagnostics.schemas.map(schema => schema.fileMatch[0] === uri ? newSchema : schema)
          : [...(oldJsonDiagnostics.schemas ?? []), newSchema],
    };

    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(newJsonDiagnostics);
  }

  setJsonComments(comments?: Monaco.languages.json.SeverityLevel): void {
    if (!comments) { return; }

    const jsonDiagnostics: Monaco.languages.json.DiagnosticsOptions = {
      ...this.monaco.languages.json.jsonDefaults.diagnosticsOptions,
      comments,
    };
    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
  }

  setJavascriptDiagnostics(options: Monaco.languages.typescript.DiagnosticsOptions): void {
    if (!options) { return; }

    const javascriptDiagnostics: Monaco.languages.typescript.DiagnosticsOptions = {
      ...this.monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions(),
      ...options,
    };
    this.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(javascriptDiagnostics);
  }

  setJavascriptTypings(typings: string): void {
    if (!typings) {
      this.jsTypingsLib?.dispose();
      return;
    }
    this.jsTypingsLib = this.monaco.languages.typescript.javascriptDefaults.addExtraLib(typings, `js-typings-${this.filename}`);
  }

  private createGlobalCache(monaco: typeof Monaco & { _2sxc?: Monaco2sxc }): Monaco2sxc {
    if (monaco._2sxc == null) {
      const _2sxc: Monaco2sxc = {
        themesAreDefined: false,
        savedStates: {},
      };
      monaco._2sxc = _2sxc;
    }
    return monaco._2sxc;
  }

  /** Registers our themes. Themes are global. Run before creating editor */
  private defineThemes(globalCache: Monaco2sxc, monaco: typeof Monaco): void {
    // there is currently no official way to get defined themes from Monaco to check if some theme was already defined
    if (globalCache.themesAreDefined) { return; }
    globalCache.themesAreDefined = true;

    monaco.editor.defineTheme('2sxc-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'metatag.cs', foreground: 'ffff00' },
      ],
      colors: {
      },
    });
  }

  private createInstance(
    monaco: typeof Monaco,
    filename: string,
    value: string,
    container: HTMLElement,
    options: Monaco.editor.IStandaloneEditorConstructionOptions,
  ): Monaco.editor.IStandaloneCodeEditor {
    const editorInstance = monaco.editor.create(container, options);
    const editorModelUri = monaco.Uri.file(filename);
    const editorModel = monaco.editor.createModel(value, undefined, editorModelUri);
    editorInstance.setModel(editorModel);
    return editorInstance;
  }

  private saveState(globalCache: Monaco2sxc, editorInstance: Monaco.editor.IStandaloneCodeEditor): void {
    const uri = editorInstance.getModel().uri.toString();
    const viewState = JSON.stringify(editorInstance.saveViewState());

    if (globalCache.savedStates[uri] == null) {
      globalCache.savedStates[uri] = { viewState };
    } else {
      globalCache.savedStates[uri].viewState = viewState;
    }
  }

  private restoreState(globalCache: Monaco2sxc, editorInstance: Monaco.editor.IStandaloneCodeEditor): void {
    const uri = editorInstance.getModel().uri.toString();
    const savedState = globalCache.savedStates[uri];
    if (savedState == null) { return; }

    const viewState: Monaco.editor.ICodeEditorViewState = JSON.parse(savedState.viewState);
    editorInstance.restoreViewState(viewState);
  }

  private addSnippets(monaco: typeof Monaco, editorInstance: Monaco.editor.IStandaloneCodeEditor): Monaco.IDisposable[] {
    const completionItemProviders = [
      monaco.languages.registerCompletionItemProvider(editorInstance.getModel().getLanguageId(), {
        triggerCharacters: ['>'],
        provideCompletionItems: (model, position) => {
          if (editorInstance.getModel() !== model) { return { suggestions: [] }; }

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
          if (voidElements.includes(tag.toLocaleLowerCase())) { return { suggestions: [] }; }
          if (!/[a-zA-Z0-9_-]/.test(tag)) { return { suggestions: [] }; }

          const suggestions: Monaco.languages.CompletionItem[] = [{
            label: `</${tag}>`,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `\$0</${tag}>`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
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

      monaco.languages.registerCompletionItemProvider(editorInstance.getModel().getLanguageId(), {
        provideCompletionItems: (model, position) => {
          if (this.snippets == null || editorInstance.getModel() !== model) { return { suggestions: [] }; }

          const word = model.getWordUntilPosition(position);
          const suggestions = this.snippets.map(snippet => {
            if (!snippet.content) { return; }
            const suggestion: Monaco.languages.CompletionItem = {
              label: snippet.name,
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: `${snippet.title ?? ''}\n${snippet.help ?? ''}\n${snippet.links ?? ''}`,
              insertText: snippet.content,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
              },
            };
            return suggestion;
          }).filter(suggestion => !!suggestion);
          return { suggestions };
        },
      }),

      monaco.languages.registerHoverProvider(editorInstance.getModel().getLanguageId(), {
        provideHover: (model, position) => {
          if (this.tooltips == null || editorInstance.getModel() !== model) { return; }

          const word = model.getWordAtPosition(position);
          if (!word) { return; }

          const tooltip = this.tooltips.find(i => i.Term === word.word);
          if (!tooltip) { return; }

          return {
            contents: tooltip.Help.map(value => {
              const content: Monaco.IMarkdownString = {
                value,
              };
              return content;
            }),
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
          };
        }
      }),
    ];

    return completionItemProviders;
  }

  private createResizeObserver(container: HTMLElement, editorInstance: Monaco.editor.IStandaloneCodeEditor): ResizeObserver {
    const resizeObserver = new ResizeObserver(() => {
      editorInstance.layout();
    });
    resizeObserver.observe(container);
    return resizeObserver;
  }

  private addEvents(editorInstance: Monaco.editor.IStandaloneCodeEditor): void {
    editorInstance.getModel().onDidChangeContent(() => {
      const newValue = editorInstance.getModel().getValue();
      if (newValue === this.cachedValue) { return; }
      this.cachedValue = newValue;
      this.valueChangedCallback?.(newValue);
    });

    editorInstance.onDidFocusEditorWidget(() => {
      this.focusedCallback?.();
    });

    editorInstance.onDidBlurEditorWidget(() => {
      this.blurredCallback?.();
    });

    // this.editorInstance.onDidChangeModelDecorations(e => {
    //   const value = this.editorInstance.getModel().getValue();
    //   const markers = this.monaco.editor.getModelMarkers({}).filter(marker => marker.resource.path === `/${this.filename}`);
    //   const valid = !markers.some(
    //     marker => marker.severity === this.monaco.MarkerSeverity.Error || marker.severity === this.monaco.MarkerSeverity.Warning
    //   );
    // });

    // this.monaco.editor.onDidChangeMarkers(() => {
    //   // markers updates are async and lagging behind value updates
    //   const markers = this.monaco.editor.getModelMarkers({}).filter(marker => marker.resource.path === `/${this.filename}`);
    //   if (markers.some(marker => marker.severity === this.monaco.MarkerSeverity.Error)) {
    //     // has errors
    //   } else if (markers.some(marker => marker.severity === this.monaco.MarkerSeverity.Warning)) {
    //     // has warnings
    //   } else {
    //     // has no errors or warnings
    //   }
    // });
  }
}
