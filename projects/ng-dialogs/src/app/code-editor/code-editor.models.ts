import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';

export interface Tab {
  viewKey: string;
  label: string;
  isActive: boolean;
  isModified: boolean;
  isLoading: boolean;
}

export interface CodeEditorTemplateVars {
  activeView: string;
  tabs: Tab[];
  viewKey: string;
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

export interface ViewInfo {
  /** ViewKey is templateId or path */
  viewKey: string;
  view?: SourceView;
  explorerSnipps?: SnippetsSets;
  editorSnipps?: Snippet[];
  savedCode?: string;
}
