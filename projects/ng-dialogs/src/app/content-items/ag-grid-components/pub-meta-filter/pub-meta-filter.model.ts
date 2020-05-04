export interface PubMetaFilterModel {
  filterType: 'pub-meta';
  published: string;
  metadata: string;
}

export interface PubMeta {
  published: boolean;
  metadata: boolean;
}
