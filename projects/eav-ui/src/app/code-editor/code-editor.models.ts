import { FileAsset } from './models/file-asset.model';
import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';

export interface Tab {
  viewKey: ViewKey;
  label: string;
  isActive: boolean;
  isModified: boolean;
  isLoading: boolean;
}

export interface CodeEditorTemplateVars {
  activeView: ViewKey;
  tabs: Tab[];
  viewKey: ViewKey;
  view?: SourceView;
  templates: FileAsset[];
  explorerSnipps: SnippetsSets;
  editorSnipps: Snippet[];
}

export const Explorers = {
  Templates: 'Templates',
  Snippets: 'Snippets',
} as const;

export type ExplorerOption = typeof Explorers[keyof typeof Explorers];

export interface ViewInfo {
  viewKey: ViewKey;
  view?: SourceView;
  explorerSnipps?: SnippetsSets;
  editorSnipps?: Snippet[];
  savedCode?: string;
}

export interface ViewKey {
  /** ViewKey is templateId or path */
  key: string;
  shared: boolean;
}
