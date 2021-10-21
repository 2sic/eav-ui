import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';

export interface CodeEditorTemplateVars {
  view: SourceView;
  templates: string[];
  explorerSnipps: SnippetsSets;
  editorSnipps: Snippet[];
}

export const Explorers = {
  Templates: 'Templates',
  Snippets: 'Snippets',
} as const;

export type ExplorerOption = typeof Explorers[keyof typeof Explorers];

export const Editors = {
  Ace: 'Ace',
  Monaco: 'Monaco',
} as const;

export type EditorOption = typeof Editors[keyof typeof Editors];
