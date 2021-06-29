import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';

export interface CodeEditorTemplateVars {
  view: SourceView;
  templates: string[];
  explorerSnipps: SnippetsSets;
  editorSnipps: Snippet[];
}
