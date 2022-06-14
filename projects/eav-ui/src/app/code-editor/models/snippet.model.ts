export interface Snippet {
  content?: string;
  help?: string;
  links?: string;
  name?: string;
  set: string;
  subset: string;
  title?: string;
}

export interface SnippetsSets {
  [set: string]: SnippetsSubSets;
}

export interface SnippetsSubSets {
  [subset: string]: SetSnippet[] | SnippetsSubSubSets;
}

export interface SnippetsSubSubSets {
  [subsubset: string]: SetSnippet;
}

export interface SetSnippet {
  help: string;
  key: string;
  label: string;
  links?: SetSnippetLink[];
  more?: Record<string, MoreSnippet>;
  snip: string;
}

export interface SetSnippetLink {
  name: string;
  url: string;
}

export interface MoreSnippet {
  collapse: boolean;
  help: string;
  key: string;
  label: string;
  snip: string;
}
