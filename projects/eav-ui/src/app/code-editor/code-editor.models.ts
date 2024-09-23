import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';
import { Tooltip } from './models/tooltip.model';

export interface Tab {
  viewKey: ViewKey;
  label: string;
  isActive: boolean;
  isModified: boolean;
  isLoading: boolean;
}

export const Explorers = {
  Templates: 'Templates',
  Snippets: 'Snippets',
} as const /* the as const ensures that the keys/values can be strictly checked */;

export type ExplorerOption = typeof Explorers[keyof typeof Explorers];

export interface ViewInfo {
  viewKey: ViewKey;
  view?: SourceView;
  explorerSnipps?: SnippetsSets;
  editorSnipps?: Snippet[];
  tooltips?: Tooltip[];
  savedCode?: string;
}

export interface ViewKey {
  /** ViewKey is templateId or path */
  key: string;
  shared: boolean;
}
