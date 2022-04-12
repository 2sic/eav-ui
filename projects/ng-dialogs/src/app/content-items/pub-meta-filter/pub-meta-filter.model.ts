export interface PubMetaFilterModel {
  filterType: 'pub-meta';
  published: string;
  metadata: string;
  hasMetadata: string;
}

export interface PubMeta {
  published: boolean;
  metadata: boolean;
  hasMetadata: boolean;
}
