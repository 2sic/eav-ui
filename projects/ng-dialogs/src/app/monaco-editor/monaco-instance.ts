import { JsonSchema, Monaco2sxc, MonacoType } from '.';
import { Snippet } from '../code-editor/models/snippet.model';

export class MonacoInstance {
  /** Editor instance configuration */
  private editorInstance: MonacoType;
  private completionItemProviders: MonacoType[];
  private resizeObserver: ResizeObserver;
  private globalCache: Monaco2sxc;
  private cachedValue: string;
  private valueChangedCallback?: (value: string) => void;
  private focusedCallback?: () => void;
  private blurredCallback?: () => void;

  constructor(
    /** Global Monaco configuration */
    private monaco: MonacoType,
    filename: string,
    value: string,
    container: HTMLElement,
    options: MonacoType,
    private snippets: Snippet[],
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
    this.completionItemProviders.forEach(completionItemProvider => {
      completionItemProvider.dispose();
    });
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
    const snippetController = this.editorInstance.getContribution('snippetController2');
    snippetController.insert(snippet);
  }

  setSnippets(snippets: Snippet[]): void {
    this.snippets = snippets;
  }

  setJsonSchema(jsonSchema: JsonSchema): void {
    const uri = this.editorInstance.getModel().uri.toString();
    const jsonDiagnostics = {
      ...this.monaco.languages.json.jsonDefaults.diagnosticsOptions,
      enableSchemaRequest: true,
    };
    const exists = jsonDiagnostics.schemas.some((schema: MonacoType) => schema.fileMatch[0] === uri);

    if (jsonSchema?.value) {
      const newSchema = jsonSchema.type === 'link'
        ? { uri: jsonSchema.value, fileMatch: [uri] }
        : { uri, fileMatch: [uri], schema: JSON.parse(jsonSchema.value) };

      jsonDiagnostics.schemas = exists
        ? jsonDiagnostics.schemas.map((schema: MonacoType) => schema.fileMatch[0] === uri ? newSchema : schema)
        : [...jsonDiagnostics.schemas, newSchema];
    } else {
      if (!exists) { return; }
      jsonDiagnostics.schemas = jsonDiagnostics.schemas.filter((schema: MonacoType) => schema.fileMatch[0] !== uri);
    }

    this.monaco.languages.json.jsonDefaults.setDiagnosticsOptions(jsonDiagnostics);
  }

  private createGlobalCache(monaco: MonacoType): Monaco2sxc {
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
  private defineThemes(globalCache: Monaco2sxc, monaco: MonacoType): void {
    // there is currently no official way to get defined themes from Monaco to check if some theme was already defined
    if (globalCache.themesAreDefined) { return; }
    globalCache.themesAreDefined = true;

    monaco.editor.defineTheme('2sxc-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'metatag.cs', foreground: 'ffff00' },
      ],
    });
  }

  private createInstance(monaco: MonacoType, filename: string, value: string, container: HTMLElement, options: MonacoType): MonacoType {
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
    const editorInstance = monaco.editor.create(container, options);
    // editorInstance.updateOptions({ readOnly: true })
    const editorModelUri = monaco.Uri.file(filename);
    const editorModel = monaco.editor.createModel(value, undefined, editorModelUri);
    editorInstance.setModel(editorModel);
    // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodelupdateoptions.html
    // editorInstance.getModel().updateOptions({ tabSize: 2 });
    return editorInstance;
  }

  private saveState(globalCache: Monaco2sxc, editorInstance: MonacoType): void {
    const uri = editorInstance.getModel().uri.toString();
    const viewState = JSON.stringify(editorInstance.saveViewState());

    if (globalCache.savedStates[uri] == null) {
      globalCache.savedStates[uri] = { viewState };
    } else {
      globalCache.savedStates[uri].viewState = viewState;
    }
  }

  private restoreState(globalCache: Monaco2sxc, editorInstance: MonacoType): void {
    const uri = editorInstance.getModel().uri.toString();
    const savedState = globalCache.savedStates[uri];
    if (savedState == null) { return; }

    const viewState = JSON.parse(savedState.viewState);
    editorInstance.restoreViewState(viewState);
  }

  private addSnippets(monaco: MonacoType, editorInstance: MonacoType): MonacoType[] {
    const completionItemProviders = [
      monaco.languages.registerCompletionItemProvider(editorInstance.getModel().getModeId(), {
        triggerCharacters: ['>'],
        provideCompletionItems: (model: MonacoType, position: MonacoType) => {
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
          if (!/[a-zA-Z0-9_-]/.test(tag)) { return { suggestions: [] }; }

          const suggestions = [{
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

      monaco.languages.registerCompletionItemProvider(editorInstance.getModel().getModeId(), {
        provideCompletionItems: (model: MonacoType, position: MonacoType) => {
          if (this.snippets == null || editorInstance.getModel() !== model) { return { suggestions: [] }; }

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
              kind: monaco.languages.CompletionItemKind.Snippet,
              documentation: `${snippet.title ?? ''}\n${snippet.help ?? ''}\n${snippet.links ?? ''}`,
              insertText: snippet.content,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
            };
          }).filter(snippet => !!snippet);
          return { suggestions };
        },
      }),
    ];

    return completionItemProviders;
  }

  private createResizeObserver(container: HTMLElement, editorInstance: MonacoType): ResizeObserver {
    const resizeObserver = new ResizeObserver(() => {
      editorInstance.layout();
    });
    resizeObserver.observe(container);
    return resizeObserver;
  }

  private addEvents(editorInstance: MonacoType): void {
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
  }
}
